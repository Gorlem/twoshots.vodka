import _ from 'lodash';

import Step from './Step.js';
import StepWithVote from './StepWithVote.js';

import { get, template, keys } from '../texts.js';
import generateShots from '../shots.js';

import CountdownStep from './CountdownStep.js';

const explanationText = get('generic', 'categories:explanation');
const gameText = get('generic', 'categories:game');
const resultsText = get('generic', 'categories:results');

class ExplanationStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    if (room.cache.categories == null || room.cache.categories.length === 0) {
      room.cache.categories = _.shuffle(keys('categories'));
    }

    const key = room.cache.categories.shift();
    this.shots = generateShots(1, 5);
    this.category = get('categories', key);

    this.global.card = 'ConfirmationCard';
    this.global.data = {
      ...template(explanationText, {
        shots: this.shots,
        category: this.category.category,
        size: this.category.answers.length,
      }),
      title: this.category.category,
      ...explanationText.data,
    };

    this.update();
  }

  nextStep() {
    this.handler.nextStep({ category: this.category, shots: this.shots });
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

  constructor(handler, room, { category, shots }) {
    super(room);
    this.handler = handler;
    this.category = category;
    this.shots = shots;

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
    this.handler.nextStep({ shots: this.shots, category: this.category, results: this.results });
    clearInterval(this.interval);
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

    if (this.category.answers.includes(cleaned)) {
      const answers = this.results.get(user);
      answers.add(cleaned);

      this.players[user.id].data = {
        ...template({ footer: gameText.footer }, { correct: answers.size }),
      };
      this.send();

      if (answers.size === this.category.answers.length) {
        this.nextStep();
      }
    }
  }
}

class ResultStep extends Step {
  constructor(handler, room, { category, shots, results }) {
    super(room);

    const sorted = _(results)
      .entries()
      .map((entry) => [entry[0], entry[1].size])
      .orderBy('1', 'desc');

    const winner = sorted.first();
    const loser = sorted.last();

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(resultsText, {
        shots,
        winner: winner[0].name,
        winnerCorrect: winner[1],
        loser: loser[0].name,
        loserCorrect: loser[1],
        url: category.source,
        domain: new URL(category.source).hostname,
      }),
      title: category.category,
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
