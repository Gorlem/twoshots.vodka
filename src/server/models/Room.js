import _ from 'lodash';
import winston from 'winston';

import Vote from './Vote.js';

import FlowHandler from '../flows/FlowHandler.js';
import LobbyFlow from '../flows/technical/LobbyFlow.js';
import SetupFlow from '../flows/technical/SetupFlow.js';

import { get, template } from '../texts.js';

const seatsText = get('generic', 'seats:single');

export default class Room {
  spectating = new Set();
  playing = new Set();
  pending = new Set();

  id = '';
  vote = null;

  handler = new FlowHandler(this);
  cache = {};

  seating = [];

  constructor(id) {
    this.id = id;

    this.logger = winston.child({ room: id });

    this.handler.addListener(this.nextFlow.bind(this));

    this.vote = new Vote(this, this.handler.skip.bind(this.handler));
    this.vote.setPercentage(50.1);

    this.handler.pushFlow(LobbyFlow);
    this.handler.pushFlow(SetupFlow);
    this.handler.next();
  }

  action(user, ...payload) {
    if (this.playing.has(user)) {
      this.handler.action(user, ...payload);
    }
    if (this.pending.has(user)) {
      this.seating.splice(payload[0], 0, user);
      this.pending.delete(user);
      this.addSpectator(user);
      this.sendPendingData();
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

  sendPendingData() {
    const seating = this.seating
      .flatMap((player, i) => [
        { key: i, value: seatsText.data.seat },
        { key: player.id, value: player.name, static: true },
      ]);

    for (const user of this.pending) {
      user.sendCard('CarouselCard', {
        ...template(seatsText),
        options: seating,
      });
    }
  }

  forceFlow(flowName) {
    this.handler.forceFlow(flowName);
  }

  nextFlow() {
    for (const user of [...this.spectating]) {
      if (this.seating.includes(user)) {
        this.playing.add(user);
        this.spectating.delete(user);
      }
    }

    this.vote.reset();
    this.sendRoomData();
  }

  isInLobby() {
    return this.handler.step instanceof LobbyFlow[0];
  }

  addUser(user) {
    this.logger.info(`Adding user ${user.name}`, { user: user.id });

    if (user.role === 'spectator') {
      this.addSpectator(user);
    } else if (this.isInLobby()) {
      this.addPlayer(user);
    } else {
      this.addPending(user);
    }
  }

  addPlayer(user) {
    this.playing.add(user);
    this.handler.addedPlayer(user);
    this.sendRoomData();
  }

  addSpectator(user) {
    this.spectating.add(user);
    this.handler.addedSpectator(user);
  }

  addPending(user) {
    this.pending.add(user);
    this.sendPendingData();
  }

  removeUser(user) {
    this.logger.info(`Removing user ${user.name}`, { user: user.id });

    if (this.seating) {
      _.pullAllBy(this.seating, [user], 'id');
    }

    if (this.playing.has(user)) {
      this.playing.delete(user);
      this.handler?.removedPlayer(user);
      this.vote.removedPlayer(user);
    }

    if (this.spectating.has(user)) {
      this.spectating.delete(user);
      this.handler?.removedSpectator(user);
    }

    if (this.pending.has(user)) {
      this.pending.delete(user);
    }

    this.sendRoomData();

    if (this.playing.size === 0 && this.spectating.size === 0) {
      this.game?.removeRoom(this);
    }
  }

  createSeating(seating) {
    const users = new Map([...this.playing].map((user) => [user.id, user]));

    this.seating = seating.map((userId) => users.get(userId));
  }
}
