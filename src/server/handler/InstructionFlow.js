import _ from 'lodash';

import { get, template, keys } from '../texts.js';
import generateShots from '../shots.js';

class InstructionStep {
  constructor(handler, room) {
    if (room.cache.instructions == null || room.cache.instructions.length === 0) {
      room.cache.instructions = _.shuffle(keys('instructions'));
    }

    const instruction = room.cache.instructions.shift();
    const players = _.chain([...room.playing.users])
      .map('name')
      .shuffle()
      .value();

    const shots = generateShots(1, 5);
    const content = get('instructions', instruction);

    room.playing.sendCard('InformationCard', {
      ...template(content, { players, shots }),
    });
    room.spectating.sendCard('InformationCard', {
      ...template(content, { players, shots }),
    });
  }
}

export default [
  InstructionStep,
];
