import _ from 'lodash';
import fs from 'fs';

import Card from './Card.js';
import Vote from '../models/Vote.js';

const games = JSON.parse(fs.readFileSync('src/server/data/games.json'));

export default class GameCard extends Card {
  state = 'explanation';
  data = {};
  game;

  vote;

  constructor(room, name) {
    super(room, name);

    this.game = games[name];

    this.vote = new Vote(this.room, () => {
      this.state = 'game';
      this.startGame();
    });

    this.vote.setCondition('all');

    this.data = this.game.explanation;
  }

  init() {
    this.sendData();
  }

  startGame() {
    this.data = {};
  }

  finishGame(winner) {
    this.state = 'finish';
    this.data = {
      ...this.data,
      title: this.game.finish.title,
      message: _.template(this.game.finish.message)({ winner }),
    };
  }

  action(user, payload) {
    if (this.state === 'explanation') {
      this.vote.submit(user);
      this.sendData();
    } else if (this.state === 'game') {
      this.gameAction(user, payload);
    }
  }

  sendData() {
    this.room.send('card:data', {
      ...this.data,
      vote: this.vote.data(),
    });
  }

  removedUser(user) {
    if (this.state === 'explanation') {
      this.vote.removedUser(user);
      this.sendData();
    }
  }
}
