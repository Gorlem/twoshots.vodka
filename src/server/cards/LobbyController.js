import Controller from './Controller.js';
import Vote from '../models/Vote.js';

export default class LobbyController extends Controller {
  constructor(room) {
    super(room);

    this.vote = new Vote(room, () => {
      room.nextCard();
    });
  }

  sendCard() {
    this.room.playing.sendCard('LobbyCard', {
      users: [...this.room.playing.users].map((user) => user.name),
      vote: this.vote.data(),
    });
  }

  addedUser() {
    this.sendCard();
  }

  removedUser() {
    this.sendCard();
  }

  action(user) {
    this.vote.submit(user);
    this.sendCard();
  }
}
