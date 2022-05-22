import _ from 'lodash';

import Instructions from './basic/Instructions.js';
import Polls from './basic/Polls.js';
import WouldYouRather from './basic/WouldYouRather.js';

import Guess from './knowledge/Guess.js';
import Categories from './knowledge/Categories.js';
import Prompts from './knowledge/Prompts.js';

import HorseRace from './games/HorseRace.js';
import Bombs from './games/Bombs.js';
import CountAndClick from './games/CountAndClick.js';
import Kingscup from './games/Kingscup.js';
import RockPaperScissor from './games/RockPaperScissor.js';
import DefendTheCastle from './games/DefendTheCastle.js';
import TaskHero from './games/TaskHero.js';

const weights = {
  Instructions: { flow: Instructions, weight: 3 },
  Polls: { flow: Polls, weight: 3 },
  WouldYouRather: { flow: WouldYouRather, weight: 3 },

  Guess: { flow: Guess, weight: 2 },
  Categories: { flow: Categories, weight: 2 },
  Prompts: { flow: Prompts, weight: 2 },

  HorseRace: { flow: HorseRace, weight: 1 },
  Bombs: { flow: Bombs, weight: 1 },
  CountAndClick: { flow: CountAndClick, weight: 1 },
  Kingscup: { flow: Kingscup, weight: 1 },
  RockPaperScissor: { flow: RockPaperScissor, weight: 1 },
  DefendTheCastle: { flow: DefendTheCastle, weight: 1 },
  TaskHero: { flow: TaskHero, weight: 1 },
};

export default class FlowDirector {
  history = [];
  flows = [];

  constructor() {
    this.flows = Object.values(weights)
      .flatMap((weighted) => _.times(weighted.weight, _.constant(weighted.flow)));
  }

  getNextFlow() {
    const flow = _(this.flows).without(this.history).sample();
    this.addToHistory(flow);
    return flow;
  }

  getFlowByName(flowName) {
    return weights[flowName].flow;
  }

  addToHistory(flow) {
    this.history.push(flow);
    if (this.history.length > 5) {
      this.history.shift();
    }
  }
}
