import Step from './Step.js';

import { get, template } from '../texts.js';

const text = get('generic', 'seats');

class SeatStep extends Step {
  constructor(handler, room) {
    super(room);
    this.handler = handler;
  }

  updateOptions() {
    this.seating = this.room.seating
      .flatMap((player, i) => [{ key: i, value: text.data.seat }, { key: player.id, value: player.name, static: true }]);

    this.global.card = 'CarouselCard';
    this.global.data = {
      ...template(text, { player: '!!!!' }),
      options: this.seating,
    };

    this.send();
  }

  addedPlayer(user) {
    user.logger.info('added to pending flow');
    this.updateOptions();
  }

  removedPlayer() {
    this.updateOptions();
  }

  action(user, value) {
    user.logger.info('action', { value });
    if (this.seating[value * 2] != null && this.seating[value * 2].key === value) {
      this.room.seating.splice(value, 0, user);
      this.players[user.id].data = {
        selected: true,
      };

      this.updateOptions();
    }
  }
}

export default [
  SeatStep,
];
