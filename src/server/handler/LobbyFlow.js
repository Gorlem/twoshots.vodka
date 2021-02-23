import Vote from '../models/Vote.js';

class LobbyStep {
  constructor(handler, room) {
    this.handler = handler;
    this.room = room;

    this.vote = new Vote(room, () => {
      handler.nextStep();
    });
  }

  sendCard() {
    this.room.playing.sendCard('LobbyCard', {
      users: [...this.room.playing.users].map((user) => user.name),
      vote: this.vote.data(),
    });
  }

  addedPlayer() {
    this.sendCard();
  }

  removedPlayer() {
    this.sendCard();
  }

  action(user) {
    this.vote.submit(user);
    this.sendCard();
  }
}

export default [
  LobbyStep,
];
