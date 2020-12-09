import Card from './Card.js';

export default class LobbyCard extends Card {
  constructor(room) {
    super(room, 'LobbyCard');
  }

  sendUsers() {
    this.room.send('card:data', {
      users: this.room.users.map((user) => user.name),
    });
  }

  init() {
    this.sendUsers();
  }

  addedUser() {
    this.sendUsers();
  }

  removedUser() {
    this.sendUsers();
  }
}
