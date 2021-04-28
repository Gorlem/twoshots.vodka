import _ from 'lodash';

import Vote from './Vote.js';

import Handler from '../handler/Handler.js';
import LobbyFlow from '../handler/LobbyFlow.js';
import PendingFlow from '../handler/PendingFlow.js';
import WaitingFlow from '../handler/WaitingFlow.js';

import InstructionFlow from '../handler/InstructionFlow.js';
import GuessFlow from '../handler/GuessFlow.js';
import PollFlow from '../handler/PollFlow.js';
import GameFlow from '../handler/GameFlow.js';
import WouldYouRatherFlow from '../handler/WouldYouRatherFlow.js';

const flows = {
  InstructionFlow,
  GuessFlow,
  PollFlow,
  GameFlow,
  WouldYouRatherFlow,
};

export default class Room {
  spectating = new Set();
  playing = new Set();
  pending = new Set();

  id = '';
  vote = null;

  handler = new Handler(this, this.nextFlow.bind(this));
  cache = {};

  constructor(id) {
    this.id = id;
    this.vote = new Vote(this, this.nextFlow.bind(this));
    this.vote.setPercentage(50.1);

    this.handler.pushFlow(LobbyFlow);
    this.handler.nextStep();
  }

  action(user) {
    this.vote.submit(user);

    this.sendRoomData();
  }

  sendRoomData() {
    if (this.isInLobby()) {
      return;
    }

    for (const player of this.playing) {
      player.send('room:data', {
        vote: this.vote.data(),
      });
    }
  }

  addPlayer(user) {
    user.handler.setRedirect(this.handler);
    this.playing.add(user);
    this.handler.addedPlayer(user);
    this.sendRoomData();
  }

  addPending(user) {
    this.pending.add(user);
    user.handler.pushFlow(WaitingFlow);
    user.handler.nextFlow();
  }

  addSpectator(user) {
    user.handler.setRedirect(this.handler);
    this.spectating.add(user);
    this.handler.addedSpectator(user);
  }

  forceFlow(flowName) {
    const flow = flows[flowName];

    if (this.cache.flows == null || this.cache.flows.length === 0) {
      this.cache.flows = [flow];
    } else {
      this.cache.flows.unshift(flow);
    }

    this.nextFlow();
  }

  nextFlow() {
    if (this.cache.flows == null || this.cache.flows.length === 0) {
      this.cache.flows = _(flows).values().shuffle().value();
    }

    let flow;
    if (this.pending.size > 0) {
      flow = PendingFlow;
    } else {
      flow = this.cache.flows.shift();
    }

    this.handler.pushFlow(flow);
    this.handler.nextFlow();

    this.vote.reset();
    this.sendRoomData();
  }

  isInLobby() {
    return this.handler.step instanceof LobbyFlow[0];
  }

  remove(user) {
    console.log(`removing ${user} from ${this}`);

    if (this.playing.has(user)) {
      this.playing.delete(user);
      this.handler?.removedPlayer(user);
    }

    if (this.spectating.has(user)) {
      this.spectating.delete(user);
      this.handler?.removedSpectator(user);
    }

    if (this.pending.has(user)) {
      this.pending.delete(user);
    }

    user.send('room:data', null);
    this.sendRoomData();

    if (this.playing.size === 0 && this.spectating.size === 0) {
      this.game?.removeRoom(this);
    }
  }
}
