import _ from 'lodash';

import { template } from '../template.js';
import generateShots from '../shots.js';

class HorseRaceGameResult {
  constructor({ room }, horses) {
    const winner = _.maxBy([...horses], '1')[0].name;
    const tracks = _.chain([...horses])
      .sortBy((horse) => horse[1])
      .reverse()
      .map((horse) => ({
        distance: horse[1],
        name: horse[0].name,
      }))
      .value();

    room.playing.sendCard('HorseRaceGameResults', {
      tracks,
      title: template(room.controller.messages.finish.title),
      message: template(room.controller.messages.finish.message, {
        winner,
        shots: generateShots(3, 6),
      }),
    });
  }
}

export default class HorseRaceGame {
  horses = new Map();

  constructor({ room }) {
    this.room = room;

    for (const user of room.playing.users) {
      this.horses.set(user, 0);
    }

    this.room.playing.sendCard('HorseRaceGame', {
      track: {
        distance: 0,
      },
    });
  }

  removedUser(user) {
    this.horses.delete(user);
  }

  action(user) {
    const distance = this.horses.get(user) + 10;
    this.horses.set(user, distance);

    user.sendCard('HorseRaceGame', {
      track: {
        distance,
      },
    });

    if (distance >= 100) {
      setImmediate(() => this.room.controller.setStep(new HorseRaceGameResult({ room: this.room }, this.horses)));
    }
  }
}
