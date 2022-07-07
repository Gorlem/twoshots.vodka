import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import generateShots from '../../shots.js';
import Cache from '../../models/Cache.js';

const explanationText = get('generic', 'guess:explanation');
const resultsSingleSingleText = get('generic', 'guess:results/single/single');
const resultsMultipleSingleText = get('generic', 'guess:results/multiple/single');
const resultsSingleMultipleText = get('generic', 'guess:results/single/multiple');
const resultsMultipleMultipleText = get('generic', 'guess:results/multiple/multiple');

class GuessStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.guesses == null) {
      room.cache.guesses = new Cache(keys('guesses'));
    }

    const key = room.cache.guesses.get();
    this.guess = get('guesses', key);

    this.global.data = {
      ...template(explanationText),
      title: this.guess.question,
    };

    this.playing.card = 'InputCard';
    this.playing.data = {
      hint: this.guess.unit,
      type: 'number',
      button: explanationText.data.button,
    };

    this.spectating.card = 'InformationCard';

    this.update();
  }

  nextStep() {
    this.room.handler.next({ guess: this.guess, results: [...this.vote.results] });
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
  constructor(room, { guess, results }) {
    super(room);

    const differences = results
      .map(([user, result]) => [
        user,
        Math.abs(guess.answer - Number.parseFloat(result.replace(',', '.'))),
      ]);

    const max = _.maxBy(differences, '1')[1];
    const min = _.minBy(differences, '1')[1];

    const winner = differences
      .filter((result) => result[1] === min)
      .map((result) => result[0].name);

    const loser = differences
      .filter((result) => result[1] === max)
      .map((result) => result[0].name);

    let text = resultsSingleSingleText;

    if (winner.length > 1 && loser.length > 1) {
      text = resultsMultipleMultipleText;
    } else if (winner.length > 1) {
      text = resultsMultipleSingleText;
    } else if (loser.length > 1) {
      text = resultsSingleMultipleText;
    }

    const answer = guess.answer.toLocaleString('de-DE', { useGrouping: false }) + (guess.unit == null ? '' : ` ${guess.unit}`);

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(text, {
        shots: generateShots(1, 5),
        winner: winner.join('*, *'),
        loser: loser.join('*, *'),
        answer,
        url: guess.source,
        domain: new URL(guess.source).hostname,
      }),
      title: guess.question,
      options: results.map(([user, result]) => ({
        key: user.id,
        value: user.name,
        result: result.toLocaleString('de-DE', { useGrouping: false }) + (guess.unit == null ? '' : ` ${guess.unit}`),
      })),
    };

    this.send();
  }
}

export default [
  GuessStep,
  ResultStep,
];
