import _ from 'lodash';
import winston from 'winston';

import Vote from './Vote.js';

import Handler from '../handler/Handler.js';
import LobbyFlow from '../handler/LobbyFlow.js';
import SetupFlow from '../handler/SetupFlow.js';

import InstructionFlow from '../handler/InstructionFlow.js';
import GuessFlow from '../handler/GuessFlow.js';
import PollFlow from '../handler/PollFlow.js';
import WouldYouRatherFlow from '../handler/WouldYouRatherFlow.js';
import GameFlow from '../handler/GameFlow.js';
import TeamGameFlow from '../handler/TeamGameFlow.js';
import CategoryFlow from '../handler/CategoryFlow.js';
import PromptsFlow from '../handler/PromptsFlow.js';

const flows = {
  InstructionFlow,
  GuessFlow,
  PollFlow,
  WouldYouRatherFlow,
  GameFlow,
  TeamGameFlow,
  CategoryFlow,
  PromptsFlow,
};

export default class Room {
  spectating = new Set();
  playing = new Set();
  pending = new Set();

  id = '';
  vote = null;

  handler = new Handler(this, this.nextFlow.bind(this));
  cache = {};

  seating = [];
  pendingRoom = null;

  constructor(id) {
    this.id = id;

    this.logger = winston.child({ room: id });

    this.vote = new Vote(this, this.nextFlow.bind(this));
    this.vote.setPercentage(50.1);

    this.handler.pushFlow(LobbyFlow);
    this.handler.pushFlow(SetupFlow);
    this.handler.nextStep();
  }

  action(user, ...payload) {
    if (this.playing.has(user)) {
      this.handler.action(user, ...payload);
    }
    if (this.pending.has(user)) {
      this.pendingRoom.action(user, ...payload);
    }
  }

  roomVote(user) {
    this.vote.submit(user);

    this.sendRoomData();
  }

  sendRoomData() {
    if (this.isInLobby()) {
      return;
    }

    for (const player of this.playing) {
      player.send('room/vote', this.vote.data());
    }
  }

  addPlayer(user) {
    this.playing.add(user);
    this.handler.addedPlayer(user);
    this.sendRoomData();
  }

  addPending(user) {
    this.pending.add(user);
    this.pendingRoom.addPlayer(user);
  }

  addSpectator(user) {
    this.spectating.add(user);
    this.handler.addedSpectator(user);
  }

  forceFlow(flowName) {
    const flow = flows[flowName];

    if (flow == null) {
      return;
    }

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

    if (this.pending.size > 0) {
      for (const user of [...this.pending]) {
        if (this.seating.includes(user)) {
          this.playing.add(user);
          this.pending.delete(user);
          this.pendingRoom.remove(user);
        }
      }
    }

    const flow = this.cache.flows.shift();

    this.handler.pushFlow(flow);
    this.handler.nextFlow();

    this.vote.reset();
    this.sendRoomData();
  }

  isInLobby() {
    return this.handler.step instanceof LobbyFlow[0];
  }

  remove(user) {
    this.logger.info(`Removing user ${user.name}`, { user: user.id });

    if (this.seating) {
      _.pullAllBy(this.seating, [user], 'id');
    }

    if (this.playing.has(user)) {
      this.playing.delete(user);
      this.handler?.removedPlayer(user);
      this.vote.reset(user);
    }

    if (this.spectating.has(user)) {
      this.spectating.delete(user);
      this.handler?.removedSpectator(user);
    }

    if (this.pending.has(user)) {
      this.pending.delete(user);
      this.pendingRoom.remove(user);
    }

    this.sendRoomData();

    if (this.playing.size === 0 && this.spectating.size === 0) {
      this.game?.removeRoom(this);
    }
  }
}
