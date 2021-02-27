import _ from 'lodash/fp.js';

import Vote from '../models/Vote.js';

import { get, template, keys } from '../texts.js';
import generateShots from '../shots.js';

const explanation = get('generic', 'guess:explanation');
const voted = get('generic', 'voted');

class GuessStep {
  constructor(handler, room) {
    this.room = room;

    if (room.cache.guesses == null || room.cache.guesses.length === 0) {
      room.cache.guesses = _.shuffle(keys('guesses'));
    }

    const key = room.cache.guesses.shift();
    this.shots = generateShots(1, 5);
    const guess = get('guesses', key);

    this.content = {
      ...explanation,
      ...voted,
      title: guess.question,
      hint: guess.unit,
      type: 'number',
      button: explanation.data.button,
    };

    this.vote = new Vote(this.room, () => {
      handler.nextStep({ guess, shots: this.shots, results: this.vote.results });
    });

    this.sendQuestionData();
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.sendQuestionData();
  }

  sendQuestionData() {
    for (const player of this.room.playing.users) {
      player.sendCard('InputCard', {
        ...this.content,
        ...template(this.content, { shots: this.shots, ...this.vote.data() }),
        selected: this.vote.results.has(player),
      });
    }

    this.room.spectating.sendCard('InformationCard', {
      ...this.content,
      ...template(this.content, { shots: this.shots, ...this.vote.data() }),
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

    const users = [...results.entries()];

    const winner = getWinner(users)[0].name;
    const loser = getLoser(users)[0].name;

    const answer = guess.answer.toLocaleString('de-DE', { useGrouping: false }) + (guess.unit == null ? '' : ` ${guess.unit}`);

    for (const target of [room.playing, room.spectating]) {
      target.sendCard('InformationCard', {
        ...template(content, {
          shots,
          winner,
          loser,
          answer,
          url: guess.source,
          domain: new URL(guess.source).hostname,
          results: [...results.values()],
        }),
        title: guess.question,
      });
    }
  }
}

export default [
  GuessStep,
  ResultStep,
];
