import Step from '../../steps/Step.js';

import { get, template } from '../../texts.js';

const seatsText = get('generic', 'seats:single');

class SeatStep extends Step {
  updateOptions() {
    this.seating = this.room.seating
      .flatMap((player, i) => [{ key: i, value: seatsText.data.seat }, { key: player.id, value: player.name, static: true }]);

    this.global.card = 'CarouselCard';
    this.global.data = {
      ...template(seatsText),
      options: this.seating,
    };

    this.send();
  }

  addedPlayer() {
    this.updateOptions();
  }

  removedPlayer() {
    this.updateOptions();
  }

  action(user, value) {
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
