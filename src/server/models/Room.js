import Card from '../cards/Card.js';

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
    user.send('card', this.card.toJson());

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

    for (const channel of this.listeners.keys()) {
      user.off(channel);
    }
  }

  setCard(card) {
    this.card = card;
    this.sendCard();
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
    this.send('card', this.card.toJson());
  }

  nextCard() {
    this.card = new Card(this, 'StartGameCard');
    this.sendCard();
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
