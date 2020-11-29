export default class Card {
  name = '';
  room = null;

  constructor(room, name) {
    this.room = room;
    this.name = name;
  }

  toJson() {
    return {
      name: this.name,
    };
  }

  toString() {
    return `Card = { name = ${this.name} }`;
  }
}
