import Card from './Card.js';

export default class LobbyCard extends Card {
  constructor(room) {
    super(room, 'LobbyCard');
    this.vote.setMinimum(2);
    this.vote.setCondition('all');
  }
}
