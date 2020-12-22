import _ from 'lodash';
import fs from 'fs';

import Controller from './Controller.js';
import Vote from '../models/Vote.js';

import HorseRaceGame from '../games/HorseRaceGame.js';

import { prepare, template } from '../template.js';

const gameMessages = JSON.parse(fs.readFileSync('src/server/data/games.json'));

const games = {
  HorseRaceGame,
};

for (const game of Object.values(gameMessages)) {
  for (const messages of Object.values(game)) {
    messages.title = prepare(messages.title);
    messages.message = prepare(messages.message);
  }
}

class ExplanationStep {
  constructor({ room, messages }) {
    this.room = room;
    this.messages = messages;

    this.vote = new Vote(this.room, () => {
      room.controller.setGameStep();
    });

    this.sendCard();
  }

  sendCard() {
    this.room.playing.sendCard('ConfirmationCard', {
      title: template(this.messages.explanation.title),
      message: template(this.messages.explanation.message),
      vote: this.vote.data(),
    });
  }

  action(user) {
    this.vote.submit(user);
    this.sendCard();
  }

  removedUser(user) {
    this.vote.removedUser(user);
    this.sendCard();
  }
}

export default class GameController extends Controller {
  constructor(room) {
    super(room);

    const gameName = _.sample(_.keys(games));

    this.messages = gameMessages[gameName];
    this.Game = games[gameName];
    this.setExplanationStep();
  }

  setExplanationStep() {
    this.setStep(new ExplanationStep(this));
  }

  setGameStep() {
    this.setStep(new this.Game(this));
  }
}
