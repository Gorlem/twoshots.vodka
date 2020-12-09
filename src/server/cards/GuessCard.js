import _ from 'lodash/fp.js';
import fs from 'fs';

import Card from './Card.js';
import Vote from '../models/Vote.js';

const guesses = JSON.parse(fs.readFileSync('src/server/data/guesses.json'));

export default class GuessCard extends Card {
  data = {};

  guessVote;

  constructor(room) {
    super(room, 'GuessCard');

    const guess = _.sample(guesses);

    this.guessVote = new Vote(this.room, () => {
      const getDifference = (entry) => Math.abs(guess.answer - Number.parseFloat(entry[1].replace(',', '.')));

      const getWinner = _.minBy(getDifference);
      const getLoser = _.flow([
        _.reverse,
        _.maxBy(getDifference),
      ]);

      const voted = [...this.guessVote.results.entries()];

      this.data = {
        ...guess,
        winner: getWinner(voted)[0].name,
        loser: getLoser(voted)[0].name,
      };

      this.sendQuestionData();
    });

    this.guessVote.setCondition('all');

    this.data = {
      question: guess.question,
      unit: guess.unit,
    };
  }

  action(user, payload) {
    this.guessVote.submit(user, payload);
    this.sendQuestionData();
  }

  sendQuestionData() {
    this.room.send('card:data', {
      ...this.data,
      vote: this.guessVote.data(),
    });
  }

  init() {
    this.sendQuestionData();
  }

  removedUser(user) {
    this.guessVote.removedUser(user);
    this.sendQuestionData();
  }
}
