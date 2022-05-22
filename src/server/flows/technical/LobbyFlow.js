import StepWithVote from '../../steps/StepWithVote.js';
import { get, template } from '../../texts.js';

const content = get('generic', 'lobby');

class LobbyStep extends StepWithVote {
  constructor(room) {
    super(room);

    this.global.card = 'LobbyCard';
    this.global.data = {
      ...template(content, { roomId: this.room.id }),
    };

    this.playing.data = {
      button: content.data.button,
    };

    this.vote.setPercentage(100);
    this.vote.setMinimum(2);

    this.updateCard();
  }

  updateCard() {
    this.global.data = {
      ...this.global.data,
      users: [...this.room.playing].map((user) => user.name),
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next();
  }

  addedPlayer() {
    this.updateCard();
  }

  removedPlayer() {
    this.updateCard();
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
