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

import Cache from '../models/Cache.js';

const flows = {
  Instructions,
  Polls,
  WouldYouRather,

  Guess,
  Categories,
  Prompts,

  HorseRace,
  Bombs,
  CountAndClick,
  Kingscup,
  RockPaperScissor,
  DefendTheCastle,
  TaskHero,
};

export default class FlowDirector {
  constructor() {
    this.basic = new Cache([Instructions, Polls, WouldYouRather]);
    this.knowledge = new Cache([Guess, Categories, Prompts]);
    this.games = new Cache([HorseRace, Bombs, CountAndClick, Kingscup, RockPaperScissor, DefendTheCastle, TaskHero]);

    this.cache = new Cache(() => [this.basic.get(), this.basic.get(), this.knowledge.get(), this.games.get()]);
  }

  getNextFlow() {
    return this.cache.get();
  }

  getFlowByName(flowName) {
    return flows[flowName];
  }
}
