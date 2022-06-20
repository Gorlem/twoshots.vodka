import Vote from './Vote.js';

import FlowHandler from '../flows/FlowHandler.js';
import LobbyFlow from '../flows/technical/LobbyFlow.js';

export default class Room {
  spectating = new Set();
  playing = new Set();
  pending = new Set();

  id = '';
  vote = null;

  handler = new FlowHandler(this);
  cache = {};

  constructor(id) {
    this.id = id;

    this.handler.addListener(this.nextFlow.bind(this));

    this.vote = new Vote(this, this.handler.skip.bind(this.handler));
    this.vote.setPercentage(50.1);

    this.handler.pushFlow(LobbyFlow);
    this.handler.next();
  }

  action(user, ...payload) {
    if (this.playing.has(user)) {
      this.handler.action(user, ...payload);
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

  forceFlow(flowName) {
    this.handler.forceFlow(flowName);
  }

  nextFlow() {
    for (const user of [...this.pending]) {
      this.playing.add(user);
      this.spectating.delete(user);
      this.pending.delete(user);
    }

    this.vote.reset();
    this.sendRoomData();
  }

  isInLobby() {
    return this.handler.step instanceof LobbyFlow[0];
  }

  addUser(user) {
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
    this.addSpectator(user);
  }

  removeUser(user) {
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
}
