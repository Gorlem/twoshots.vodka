export default class Card {
  name = '';
  room = null;
  vote = null;

  constructor(room, name) {
    this.room = room;
    this.name = name;
  }

  toString() {
    return `${this.name} = { data = ${this.data} }`;
  }
}
