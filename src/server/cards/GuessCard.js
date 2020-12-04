import _ from 'lodash/fp.js';
import fs from 'fs';

import Card from './Card.js';
import Vote from '../models/Vote.js';

const guesses = JSON.parse(fs.readFileSync('src/server/data/guesses.json'));

export default class GuessCard extends Card {
  guessVote;

  constructor(room) {
    super(room, 'GuessCard');

    const guess = _.sample(guesses);

    this.guessVote = new Vote(this, 'card:guess', () => {
      const getDifference = (entry) => Math.abs(Number.parseFloat(guess.answer) - Number.parseFloat(entry[1]));

      const getWinner = _.minBy(getDifference);
      const getLoser = _.flow([
        _.reverse,
        _.maxBy(getDifference),
      ]);

      const voted = [...this.guessVote.voted.entries()];

      this.data.answer = guess.answer;
      this.data.source = guess.source;
      this.data.winner = getWinner(voted)[0].name;
      this.data.loser = getLoser(voted)[0].name;
      this.room.sendCard();
    });

    this.guessVote.setCondition('all');

    this.data.question = guess.question;
    this.data.unit = guess.unit;

    this.guessVote.update();
  }

  init() {
    super.init();
    this.guessVote?.init();
  }

  destroy() {
    super.destroy();
    this.guessVote?.destroy();
  }

  update() {
    super.update();
    this.guessVote?.update();
  }

  removedUser(user) {
    super.removedUser(user);
    this.guessVote?.removedUser(user);
  }
}
