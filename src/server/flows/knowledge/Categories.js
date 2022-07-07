import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import generateShots from '../../shots.js';

import CountdownStep from '../../steps/CountdownStep.js';
import Cache from '../../models/Cache.js';

const explanationText = get('generic', 'categories:explanation');
const gameText = get('generic', 'categories:game');
const resultsText = get('generic', 'categories:results');
const correctText = get('generic', 'categories:correct');
const wrongText = get('generic', 'categories:wrong');

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
    this.room.handler.next({ category: this.category, results: this.results });
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
    const cleaned = payload.toLowerCase().replace(/[^a-zäöüß]/g, ' ');

    const answers = this.results.get(user);
    if (this.category.answers.includes(cleaned)) {
      answers.add(cleaned);

      this.players[user.id].card = 'InformationCard';
      this.players[user.id].data = {
        ...template(correctText, {
          answer: payload,
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
          answer: payload,
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

    const sorted = _(results)
      .entries()
      .map((entry) => [entry[0], entry[1].size])
      .orderBy('1', 'desc');

    const winner = sorted.first();
    const loser = sorted.last();

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        shots: generateShots(1, 5),
        winner: winner[0].name,
        winnerCorrect: winner[1],
        loser: loser[0].name,
        loserCorrect: loser[1],
        url: category.source,
        domain: new URL(category.source).hostname,
      }),
      title: category.category,
      options: sorted.map((entry) => ({
        key: entry[0].id,
        value: entry[0].name,
        result: `${entry[1]} Antworten`,
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
