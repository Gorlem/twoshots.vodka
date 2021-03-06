import _ from 'lodash';

import Vote from './Vote.js';

import UserCollection from './UserCollection.js';

import Handler from '../handler/Handler.js';
import LobbyFlow from '../handler/LobbyFlow.js';
import PendingFlow from '../handler/PendingFlow.js';

import InstructionFlow from '../handler/InstructionFlow.js';
import GuessFlow from '../handler/GuessFlow.js';
import PollFlow from '../handler/PollFlow.js';
import GameFlow from '../handler/GameFlow.js';
import WouldYouRather from '../handler/WouldYouRatherFlow.js';

const flows = [
  InstructionFlow,
  GuessFlow,
  PollFlow,
  GameFlow,
  WouldYouRather,
];

export default class Room {
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
    this.vote.setPercentage(50.1);

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
    user.handler.setRedirect(this.handler);
    this.playing.add(user);
    this.handler.addedPlayer(user);
    user.send('room:id', this.id);
  }

  addPending(user) {
    this.pending.add(user);
  }

  addSpectator(user) {
    user.handler.setRedirect(this.handler);
    this.spectating.add(user);
    this.handler.addedSpectator(user);
  }

  nextFlow() {
    if (this.cache.flows == null || this.cache.flows.length === 0) {
      this.cache.flows = _.shuffle(flows);
    }

    let flow;
    if (this.pending.users.size > 0) {
      flow = PendingFlow;
    } else {
      flow = this.cache.flows.shift();
    }

    this.handler.pushFlow(flow);
    this.handler.nextFlow();

    this.vote.reset();
    this.playing.send('room:data', {
      vote: this.vote.data(),
    });
  }

  isInLobby() {
    return this.handler.step instanceof LobbyFlow[0];
  }
}
