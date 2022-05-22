import Vote from '../models/Vote.js';
import Step from './Step.js';

import { get, template } from '../texts.js';

const votedText = get('generic', 'voted');

export default class StepWithVote extends Step {
  constructor(room) {
    super(room);

    this.vote = new Vote(room, this.nextStep.bind(this));
  }

  update() {
    this.global.data = {
      ...this.global.data,
      ...template(votedText, this.vote.data()),
    };

    this.send();
  }

  removedPlayer(user) {
    this.vote.removedPlayer(user);
    this.update();
  }
}
