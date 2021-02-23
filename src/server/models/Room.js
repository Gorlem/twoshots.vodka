import _ from 'lodash';

import Vote from './Vote.js';

import UserCollection from './UserCollection.js';

import Handler from '../handler/Handler.js';
import LobbyFlow from '../handler/LobbyFlow.js';

import InstructionFlow from '../handler/InstructionFlow.js';
import GuessFlow from '../handler/GuessFlow.js';
import PollFlow from '../handler/PollFlow.js';
import GameFlow from '../handler/GameFlow.js';

const flows = [
  InstructionFlow,
  GuessFlow,
  PollFlow,
  GameFlow,
];

export default class Room {
  all = new UserCollection();
  spectating = new UserCollection();
  pending = new UserCollection();
  playing = new UserCollection();

  id = '';
  vote = null;

  handler = new Handler(this, this.nextFlow.bind(this));
  cache = {};

  constructor(id) {
    this.id = id;
    this.vote = new Vote(this, this.nextFlow.bind(this));
    this.vote.setCondition('half+one');
    this.vote.setMinimum(2);

    this.playing.on('room:action', (user) => {
      this.vote.submit(user);
      this.playing.send('room:data', {
        vote: this.vote.data(),
      });
    });

    this.handler.pushFlow(LobbyFlow);
    this.handler.nextStep();
  }

  addPlayer(user) {
    // if (this.controller instanceof LobbyController) {
    this.playing.add(user);
    this.handler.addedPlayer(user);
    user.send('room:id', this.id);
    // } else {
    //   this.pending.add(user);
    // }
  }

  addSpectator(user) {
    this.spectating.add(user);
  }

  nextFlow() {
    if (this.cache.flows == null || this.cache.flows.length === 0) {
      this.cache.flows = _.shuffle(flows);
    }

    const flow = this.cache.flows.shift();

    this.handler.pushFlow(flow);
    this.handler.nextFlow();

    this.vote.reset();
    this.playing.send('room:data', {
      vote: this.vote.data(),
    });
  }
}
