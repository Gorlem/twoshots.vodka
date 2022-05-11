import StepWithVote from './StepWithVote.js';
import { get, template } from '../texts.js';

const content = get('generic', 'lobby');

class LobbyStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    this.global.card = 'LobbyCard';
    this.global.data = {
      ...template(content, { roomId: this.room.id }),
      users: [...this.room.playing].map((user) => user.name),
    };

    this.playing.data = {
      button: content.data.button,
    };

    this.vote.setPercentage(100);
    this.vote.setMinimum(2);

    this.update();
  }

  nextStep() {
    this.handler.nextStep();
  }

  addedPlayer() {
    this.global.data = {
      ...this.global.data,
      users: [...this.room.playing].map((user) => user.name),
    };

    this.update();
  }

  removedPlayer() {
    this.global.data = {
      ...this.global.data,
      users: [...this.room.playing].map((user) => user.name),
    };

    this.update();
  }

  action(user) {
    this.vote.submit(user);
    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

export default [
  LobbyStep,
];
