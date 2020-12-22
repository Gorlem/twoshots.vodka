import _ from 'lodash';
import fs from 'fs';

import Controller from './Controller.js';

import { prepare, template } from '../template.js';
import generateShots from '../shots.js';

const instructions = JSON.parse(fs.readFileSync('src/server/data/instructions.json'));

for (const instruction of instructions) {
  instruction.title = prepare(instruction.title);
  instruction.message = prepare(instruction.message);
}

export default class InstructionController extends Controller {
  constructor(room) {
    super(room);

    const instruction = _.sample(instructions);
    const players = _.chain([...room.playing.users])
      .map('name')
      .shuffle()
      .value();

    const shots = generateShots(1, 5);

    const title = template(instruction.title, { players, shots });
    const message = template(instruction.message, { players, shots });

    this.room.playing.sendCard('InformationCard', {
      title,
      message,
    });
  }
}
