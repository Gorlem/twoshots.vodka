import Vote from '../models/Vote.js';

export default class Card {
  name = '';
  room = null;
  vote = null;
  data = {};

  constructor(room, name) {
    this.room = room;
    this.name = name;

    this.vote = new Vote(this, 'card:next', () => {
      this.room.nextCard();
    });
    this.vote.update();
  }

  init() {
    this.vote?.init();
  }

  destroy() {
    this.vote?.destroy();
  }

  update() {
    this.vote?.update();
  }

  removedUser(user) {
    this.vote?.removedUser(user);
  }

  toJson() {
    return {
      name: this.name,
      data: this.data,
    };
  }

  toString() {
    return `${this.name} = { data = ${this.data} }`;
  }
}
