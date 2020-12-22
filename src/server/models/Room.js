import _ from 'lodash';

import Vote from './Vote.js';

import UserCollection from './UserCollection.js';

import LobbyController from '../cards/LobbyController.js';
import InstructionController from '../cards/InstructionController.js';
import GuessController from '../cards/GuessController.js';
import GameController from '../cards/GameController.js';

const cards = [
  InstructionController,
  GuessController,
  GameController,
];

export default class Room {
  all = new UserCollection();
  spectating = new UserCollection();
  pending = new UserCollection();
  playing = new UserCollection();

  id = '';
  controller = null;

  vote = null;

  listeners = new Map();

  constructor(id) {
    this.id = id;
    this.vote = new Vote(this, () => {
      this.nextCard();
      this.vote.reset();
      this.playing.send('room:data', {
        vote: this.vote.data(),
      });
    });
    this.vote.setCondition('half+one');
    this.vote.setMinimum(2);

    this.playing.on('card:action', (...args) => this.controller.action(...args));
    this.playing.on('room:action', (user) => {
      this.vote.submit(user);
      this.playing.send('room:data', {
        vote: this.vote.data(),
      });
    });

    this.setCard(new LobbyController(this));
  }

  addPlayer(user) {
    if (this.controller instanceof LobbyController) {
      this.playing.add(user);
      this.controller.addedUser(user);
      user.send('room:id', this.id);
    } else {
      this.pending.add(user);
    }
  }

  addSpectator(user) {
    this.spectating.add(user);
  }

  join(user) {
    if (user.room != null) {
      return;
    }

    if (this.controller instanceof LobbyController) {
      this.playing.add(user);

      this.sendRoomUpdate();

      user.send('card:name', this.controller.name);

      this.controller?.addedUser?.(user);
      this.sendData();

      for (const [channel, callback] of this.listeners.entries()) {
        user.on(channel, (...args) => callback(user, ...args));
      }
    } else {
      this.pending.add(user);
    }
  }

  leave(user) {
    const index = this.players.indexOf(user);

    if (index === -1) {
      return;
    }

    _.pull(this.players, user);

    this.sendRoomUpdate();
    this.controller?.removedUser?.(user);
    this.vote.removedUser(user);
    this.sendData();

    for (const channel of this.listeners.keys()) {
      user.off(channel);
    }
  }

  setCard(card) {
    this.controller?.destroy?.();
    this.controller = card;
  }

  nextCard() {
    const Card = _.sample(cards);
    this.setCard(new Card(this));
  }

  toJson() {
    return {
      id: this.id,
      users: this.players.map((user) => user.toJson()),
    };
  }

  toString() {
    return `Room { id = ${this.id}, users = ${this.players}, card = ${this.controller} }`;
  }
}
