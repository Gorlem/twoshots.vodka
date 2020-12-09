import _ from 'lodash';

import Vote from './Vote.js';

import LobbyCard from '../cards/LobbyCard.js';
import InstructionCard from '../cards/InstructionCard.js';
import GuessCard from '../cards/GuessCard.js';
import HorseRaceGame from '../games/HorseRaceGame.js';

const cards = [
  InstructionCard,
  GuessCard,
  HorseRaceGame,
];

export default class Room {
  users = [];
  id = '';
  card = null;

  vote = null;

  listeners = new Map();

  constructor(id) {
    this.id = id;
    this.vote = new Vote(this, () => {
      this.nextCard();
      this.vote.reset();
      this.sendData();
    });
    this.vote.setCondition('all');
    this.vote.setMinimum(2);

    this.on('card:action', (...args) => this.card.action(...args));
    this.on('room:action', (user) => {
      this.vote.submit(user);
      this.sendData();
    });

    this.setCard(new LobbyCard(this));
  }

  join(user) {
    if (user.room != null) {
      return;
    }

    this.users.push(user);

    this.sendRoomUpdate();

    user.send('card:name', this.card.name);

    this.card?.addedUser?.(user);
    this.sendData();

    for (const [channel, callback] of this.listeners.entries()) {
      user.on(channel, (...args) => callback(user, ...args));
    }
  }

  leave(user) {
    const index = this.users.indexOf(user);

    if (index === -1) {
      return;
    }

    _.pull(this.users, user);

    this.sendRoomUpdate();
    this.card?.removedUser?.(user);
    this.vote.removedUser(user);
    this.sendData();

    for (const channel of this.listeners.keys()) {
      user.off(channel);
    }
  }

  setCard(card) {
    this.card?.destroy?.();
    this.card = card;
    this.card.init?.();
    this.sendCard();
  }

  nextCard() {
    const Card = _.sample(cards);
    this.setCard(new Card(this));
  }

  on(channel, callback) {
    this.listeners.set(channel, callback);
    for (const user of this.users) {
      user.on(channel, (...args) => callback(user, ...args));
    }
  }

  off(channel) {
    this.listeners.delete(channel);
    for (const user of this.users) {
      user.off(channel);
    }
  }

  send(channel, ...args) {
    for (const user of this.users) {
      user.send(channel, ...args);
    }
  }

  sendRoomUpdate() {
    this.send('room:id', this.id);
  }

  sendData() {
    this.send('room:data', {
      vote: this.vote.data(),
    });
  }

  sendCard() {
    this.send('card:name', this.card.name);
  }

  toJson() {
    return {
      id: this.id,
      users: this.users.map((user) => user.toJson()),
    };
  }

  toString() {
    return `Room { id = ${this.id}, users = ${this.users}, card = ${this.card} }`;
  }
}
