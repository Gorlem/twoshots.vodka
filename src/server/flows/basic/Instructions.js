import _ from 'lodash';

import Step from '../../steps/Step.js';
import Cache from '../../models/Cache.js';

import { get, template, keys } from '../../texts.js';
import { getDistributedShots, getSelfShots } from '../../helper/Shots.js';

class InstructionStep extends Step {
  constructor(room) {
    super(room);

    if (room.cache.instructions == null) {
      room.cache.instructions = new Cache(keys('instructions'));
    }

    const instruction = room.cache.instructions.get();
    const players = _.chain([...room.playing])
      .map('name')
      .shuffle()
      .value();

    const content = get('instructions', instruction);

    this.global.card = 'InformationCard';
    this.global.data = template(content, {
      players,
      selfShots: getSelfShots(),
      distributedShots: getDistributedShots(),
    });

    this.send();
  }
}

export default [
  InstructionStep,
];
