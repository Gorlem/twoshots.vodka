import Vote from '../models/Vote.js';
import { get, template } from '../texts.js';

const content = get('generic', 'lobby');
const voted = get('generic', 'voted');

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
      ...template({ ...content, ...voted }, { roomId: this.room.id, ...this.vote.data() }),
      users: [...this.room.playing.users].map((user) => user.name),
      button: content.data.button,
    });
    this.room.spectating.sendCard('LobbyCard', {
      ...template({ ...content, ...voted }, { roomId: this.room.id, ...this.vote.data() }),
      users: [...this.room.playing.users].map((user) => user.name),
      button: false,
    });
  }

  addedPlayer() {
    this.sendCard();
  }

  addedSpectator() {
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
