import sample from 'lodash/sample.js';

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

  listeners = new Map();

  constructor(id) {
    this.id = id;
  }

  join(user) {
    if (user.room != null) {
      return;
    }

    this.users.push(user);
    this.sendUpdate();
    user.send('card:name', this.card.name);
    user.send('card:data', this.card.data);
    this.card?.addedUser?.(user);
    this.card?.update?.();

    for (const [channel, callback] of this.listeners.entries()) {
      user.on(channel, (...args) => callback(user, ...args));
    }
  }

  leave(user) {
    const index = this.users.indexOf(user);

    if (index === -1) {
      return;
    }

    this.users.splice(index, 1);
    this.sendUpdate();
    this.card?.removedUser?.(user);
    this.card?.update?.();

    for (const channel of this.listeners.keys()) {
      user.off(channel);
    }
  }

  setCard(card) {
    this.card?.destroy?.();
    this.card = card;
    this.card.init();
    this.sendCard();
  }

  nextCard() {
    const Card = sample(cards);
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

  sendUpdate() {
    this.send('room-update', this.toJson());
  }

  sendCard() {
    this.send('card:name', this.card.name);
    this.send('card:data', this.card.data);
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
