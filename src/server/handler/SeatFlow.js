import _ from 'lodash';

import Step from './Step.js';

import { get, template } from '../texts.js';

const text = get('generic', 'seats');

class SeatStep extends Step {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    const player = _.sample([...room.playing]);

    this.seating = [...room.playing]
      .map((p, i) => (i === 0 ? { key: player.id, value: player.name, static: true } : { key: i, value: 'Freier Platz 🪑' }));

    this.global.card = 'CarouselCard';
    this.global.data = {
      ...template(text, { player: player.name }),
      options: this.seating,
    };

    this.send();
  }

  action(player, value) {
    if (this.seating[value] != null && this.seating[value].key === value) {
      const prev = this.seating.findIndex((seat) => seat.key === player.id);

      if (prev !== -1) {
        this.seating[prev] = { key: prev, value: 'Freier Platz 🪑' };
      }

      this.seating[value] = { key: player.id, value: player.name, static: true };

      this.global.data = {
        ...this.global.data,
        options: this.seating,
      };

      this.send();
    }

    if (this.seating.every((seat, i) => seat.key !== i)) {
      this.room.seating = this.seating.map((seat) => [...this.room.playing].find((p) => p.id === seat.key));
      this.handler.nextStep();
    }
  }

  removedPlayer(player) {
    const prev = this.seating.findIndex((seat) => seat.key === player.id);

    if (prev !== -1) {
      _.pullAt(this.seating, prev);
    } else {
      _.pullAt(this.seating, this.seating.findLastIndex((seat, i) => seat.key === i));
    }

    this.seating = this.seating.map((seat, i) => (seat.static ? seat : { key: i, value: 'Freier Platz 🪑' }));
  }
}

export default [
  SeatStep,
];
