import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import generateShots from '../../shots.js';

import CountdownStep from '../../steps/CountdownStep.js';

const explanationText = get('generic', 'prompts:explanation');
const gameText = get('generic', 'prompts:game');
const resultsText = get('generic', 'prompts:results');
const correctText = get('generic', 'prompts:correct');
const duplicateText = get('generic', 'prompts:duplicate');
const wrongText = get('generic', 'prompts:wrong');

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.prompts == null || room.cache.prompts.length === 0) {
      room.cache.prompts = _.shuffle(keys('prompts'));
    }

    const key = room.cache.prompts.shift();
    this.shots = generateShots(1, 5);
    this.prompt = get('prompts', key);

    this.global.card = 'ConfirmationCard';
    this.spectating.card = 'InformationCard';
    this.global.data = {
      ...template(explanationText, {
        shots: this.shots,
        amount: this.prompt.amount,
      }),
      ...explanationText.data,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next({ prompt: this.prompt, shots: this.shots });
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

  constructor(room, { prompt, shots }) {
    super(room);
    this.prompt = prompt;
    this.shots = shots;

    this.spectating.card = 'InformationCard';
    this.spectating.data = {
      title: this.prompt.question,
    };

    this.playing.card = 'InputCard';
    this.playing.data = {
      ...template(gameText, {
        points: 0,
        seconds: this.seconds,
      }),
      title: this.prompt.question,
      ...gameText.data,
    };

    for (const player of room.playing) {
      this.results.set(player, { points: 0, answers: new Set() });
    }

    this.send();

    this.interval = setInterval(this.countdown.bind(this), 1000);
  }

  nextStep() {
    this.room.handler.next({ shots: this.shots, prompt: this.prompt, results: this.results });

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

    const result = this.results.get(user);
    let userAnswer = null;

    for (const answer of this.prompt.answers) {
      if (answer.texts.includes(cleaned)) {
        userAnswer = answer;
        break;
      }
    }

    if (userAnswer != null) {
      if (result.answers.has(userAnswer.texts[0])) {
        this.players[user.id].card = 'InformationCard';
        this.players[user.id].data = {
          ...template(duplicateText, {
            answer: payload,
            points: result.points,
          }),
        };
        this.send();
      } else {
        result.answers.add(userAnswer.texts[0]);
        result.points += userAnswer.percent;

        this.players[user.id].card = 'InformationCard';
        this.players[user.id].data = {
          ...template(correctText, {
            answer: payload,
            percent: userAnswer.percent,
            points: result.points,
          }),
        };
        this.send();
      }
    } else {
      this.players[user.id].card = 'InformationCard';
      this.players[user.id].data = {
        ...template(wrongText, {
          answer: payload,
          points: result.points,
        }),
      };
      this.send();
    }

    const id = setTimeout(() => {
      _.pull(this.timeouts, id);

      this.players[user.id].card = 'InputCard';
      this.players[user.id].data = {
        ...template({ footer: gameText.footer }, { points: result.points }),
      };
      this.send();
    }, 500);
    this.timeouts.push(id);
  }
}

class ResultStep extends Step {
  constructor(room, { prompt, shots, results }) {
    super(room);

    const sorted = _(results)
      .entries()
      .map((entry) => [entry[0], entry[1].points])
      .orderBy('1', 'desc');

    const winner = sorted.first();
    const loser = sorted.last();

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        shots,
        winner: winner[0].name,
        winnerCorrect: winner[1],
        loser: loser[0].name,
        loserCorrect: loser[1],
        url: prompt.source,
        domain: new URL(prompt.source).hostname,
      }),
      title: prompt.question,
      options: sorted.map((entry) => ({
        key: entry[0].id,
        value: entry[0].name,
        result: `${entry[1]} Punkte`,
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
