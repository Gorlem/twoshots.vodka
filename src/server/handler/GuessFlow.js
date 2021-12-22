import _ from 'lodash/fp.js';

import Step from './Step.js';
import StepWithVote from './StepWithVote.js';

import { get, template, keys } from '../texts.js';
import generateShots from '../shots.js';

const explanation = get('generic', 'guess:explanation');

class GuessStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    if (room.cache.guesses == null || room.cache.guesses.length === 0) {
      room.cache.guesses = _.shuffle(keys('guesses'));
    }

    const key = room.cache.guesses.shift();
    this.shots = generateShots(1, 5);
    this.guess = get('guesses', key);

    this.global.data = {
      ...template(explanation, { shots: this.shots }),
      title: this.guess.question,
    };

    this.playing.card = 'InputCard';
    this.playing.data = {
      hint: this.guess.unit,
      type: 'number',
      button: explanation.data.button,
    };

    this.spectating.card = 'InformationCard';

    this.update();
  }

  nextStep() {
    this.handler.nextStep({ guess: this.guess, shots: this.shots, results: this.vote.results });
  }

  action(user, payload) {
    this.vote.submit(user, payload);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class ResultStep extends Step {
  constructor(handler, room, { guess, shots, results }) {
    super(room);

    const resultsText = get('generic', 'guess:results');

    const getDifference = (entry) => Math.abs(guess.answer - Number.parseFloat(entry[1].replace(',', '.')));

    const getWinner = _.minBy(getDifference);
    const getLoser = _.flow([
      _.reverse,
      _.maxBy(getDifference),
    ]);

    const users = [...results.entries()];

    const winner = getWinner(users)[0].name;
    const loser = getLoser(users)[0].name;

    const answer = guess.answer.toLocaleString('de-DE', { useGrouping: false }) + (guess.unit == null ? '' : ` ${guess.unit}`);

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        shots,
        winner,
        loser,
        answer,
        url: guess.source,
        domain: new URL(guess.source).hostname,
      }),
      title: guess.question,
      options: _.entries(results).map((e) => ({
        key: e[0].id,
        value: e[0].name,
        result: e[1].toLocaleString('de-DE', { useGrouping: false }) + (guess.unit == null ? '' : ` ${guess.unit}`),
      })),
    };

    this.send();
  }
}

export default [
  GuessStep,
  ResultStep,
];
