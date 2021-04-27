import _ from 'lodash';

import Step from './Step.js';

import { get, template, keys } from '../texts.js';
import generateShots from '../shots.js';

class InstructionStep extends Step {
  constructor(handler, room) {
    super(room);

    if (room.cache.instructions == null || room.cache.instructions.length === 0) {
      room.cache.instructions = _.shuffle(keys('instructions'));
    }

    const instruction = room.cache.instructions.shift();
    const players = _.chain([...room.playing])
      .map('name')
      .shuffle()
      .value();

    const shots = generateShots(1, 5);
    const content = get('instructions', instruction);

    this.global.card = 'InformationCard';
    this.global.data = template(content, { players, shots });

    this.send();
  }
}

export default [
  InstructionStep,
];
