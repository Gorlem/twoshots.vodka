import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import generateShots from '../../shots.js';

import CountdownStep from '../../steps/CountdownStep.js';
import Cache from '../../models/Cache.js';

const explanationText = get('generic', 'categories:explanation');
const gameText = get('generic', 'categories:game');
const correctText = get('generic', 'categories:correct');
const wrongText = get('generic', 'categories:wrong');
const resultsSingleSingleText = get('generic', 'categories:results/single/single');
const resultsMultipleSingleText = get('generic', 'categories:results/multiple/single');
const resultsSingleMultipleText = get('generic', 'categories:results/single/multiple');
const resultsMultipleMultipleText = get('generic', 'categories:results/multiple/multiple');

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.categories == null) {
      room.cache.categories = new Cache(keys('categories'));
    }

    const key = room.cache.categories.get();
    this.category = get('categories', key);

    this.global.card = 'ConfirmationCard';
    this.spectating.card = 'InformationCard';
    this.global.data = {
      ...template(explanationText, {
        category: this.category.category,
        size: this.category.answers.length,
      }),
      title: this.category.category,
      ...explanationText.data,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next({ category: this.category });
  }

  action(user, payload) {
    this.vote.submit(user, payload);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class InputStep extends Step {
  results = new Map();
  seconds = 60;

  timeouts = [];

  constructor(room, { category }) {
    super(room);
    this.category = category;

    this.spectating.card = 'InformationCard';
    this.spectating.data = {
      title: this.category.category,
    };

    this.playing.card = 'InputCard';
    this.playing.data = {
      ...template(gameText, {
        correct: 0,
        seconds: this.seconds,
      }),
      title: this.category.category,
      ...gameText.data,
    };

    for (const player of room.playing) {
      this.results.set(player, new Set());
    }

    this.send();

    this.interval = setInterval(this.countdown.bind(this), 1000);
  }

  nextStep() {
    this.stop();
    this.room.handler.next({ category: this.category, results: [...this.results] });
  }

  stop() {
    clearInterval(this.interval);
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
  }

  countdown() {
    this.seconds -= 1;

    this.playing.data = {
      ...this.playing.data,
      ...template({ message: gameText.message }, { seconds: this.seconds }),
    };
    this.send();

    if (this.seconds === 0) {
      this.nextStep();
    }
  }

  action(user, payload) {
    const cleaned = payload.toLowerCase().replace(/[^a-zäöüß]/g, ' ').trim();

    const answers = this.results.get(user);
    if (this.category.answers.includes(cleaned)) {
      answers.add(cleaned);

      this.players[user.id].card = 'InformationCard';
      this.players[user.id].data = {
        ...template(correctText, {
          answer: cleaned,
          correct: answers.size,
        }),
      };
      this.send();

      if (answers.size === this.category.answers.length) {
        this.nextStep();
      }
    } else {
      this.players[user.id].card = 'InformationCard';
      this.players[user.id].data = {
        ...template(wrongText, {
          answer: cleaned,
          correct: answers.size,
        }),
      };
      this.send();
    }

    const id = setTimeout(() => {
      _.pull(this.timeouts, id);

      this.players[user.id].card = 'InputCard';
      this.players[user.id].data = {
        ...template({ footer: gameText.footer }, { correct: answers.size }),
      };
      this.send();
    }, 500);
    this.timeouts.push(id);
  }
}

class ResultStep extends Step {
  constructor(room, { category, results }) {
    super(room);

    const max = _.maxBy(results, '1.size')[1].size;
    const min = _.minBy(results, '1.size')[1].size;

    const winner = results
      .filter((result) => result[1].size === max)
      .map((result) => result[0].name);
    const loser = results
      .filter((result) => result[1].size === min)
      .map((result) => result[0].name);

    let text = resultsSingleSingleText;

    if (winner.length > 1 && loser.length > 1) {
      text = resultsMultipleMultipleText;
    } else if (winner.length > 1) {
      text = resultsMultipleSingleText;
    } else if (loser.length > 1) {
      text = resultsSingleMultipleText;
    }

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(text, {
        shots: generateShots(1, 5),
        winner: winner.join('*, *'),
        winnerCorrect: max,
        loser: loser.join('*, *'),
        loserCorrect: min,
        url: category.source,
        domain: new URL(category.source).hostname,
      }),
      title: category.category,
      options: results.map(([user, result]) => ({
        key: user.id,
        value: user.name,
        result: `${result.size} Antworten`,
      })),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  CountdownStep,
  InputStep,
  ResultStep,
];
