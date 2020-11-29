import Card from './Card.js';
import Vote from '../models/Vote.js';

export default class LobbyCard extends Card {
  vote = null;

  constructor(room) {
    super(room, 'LobbyCard');

    this.vote = new Vote(this, 'all', () => {
      this.room.nextCard();
    });
  }

  toString() {
    return `LobbyCard { name = ${this.name}, vote = ${this.vote} }`;
  }
}
