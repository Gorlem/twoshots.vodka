import _ from 'lodash/fp.js';

import Vote from '../models/Vote.js';

import { get, template, keys } from '../texts.js';
import generateShots from '../shots.js';

class GuessStep {
  constructor(handler, room) {
    this.room = room;

    if (room.cache.guesses == null || room.cache.guesses.length === 0) {
      room.cache.guesses = _.shuffle(keys('guesses'));
    }

    const key = room.cache.guesses.shift();
    const shots = generateShots(1, 5);

    const explanation = get('generic', 'guess:explanation');
    const guess = get('guesses', key);

    this.data = {
      ...template(explanation, { shots }),
      title: guess.question,
      hint: guess.unit,
    };

    this.vote = new Vote(this.room, () => {
      handler.nextStep({ guess, shots, results: this.vote.results });
    });

    this.sendQuestionData();
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.sendQuestionData();
  }

  sendQuestionData() {
    this.room.playing.sendCard('InputCard', {
      ...this.data,
      vote: this.vote.data(),
    });
  }

  removedUser(user) {
    this.vote.removedUser(user);
    this.sendQuestionData();
  }
}

class ResultStep {
  constructor(handler, room, { guess, shots, results }) {
    const content = get('generic', 'guess:results');

    const getDifference = (entry) => Math.abs(guess.answer - Number.parseFloat(entry[1].replace(',', '.')));

    const getWinner = _.minBy(getDifference);
    const getLoser = _.flow([
      _.reverse,
      _.maxBy(getDifference),
    ]);

    const voted = [...results.entries()];

    const winner = getWinner(voted)[0].name;
    const loser = getLoser(voted)[0].name;

    const answer = guess.answer.toLocaleString('de-DE', { useGrouping: false }) + (guess.unit == null ? '' : ` ${guess.unit}`);

    room.playing.sendCard('InformationCard', {
      ...template(content, {
        shots,
        winner,
        loser,
        answer,
        url: guess.source,
        domain: new URL(guess.source).hostname,
      }),
      title: guess.question,
    });
  }
}

export default [
  GuessStep,
  ResultStep,
];
