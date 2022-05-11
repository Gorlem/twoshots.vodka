import Handler from '../handler/Handler.js';
import PendingFlow from '../handler/PendingFlow.js';

export default class PendingRoom {
  spectating = new Set();
  playing = new Set();
  pending = new Set();

  handler = new Handler(this);

  constructor(seating) {
    this.seating = seating;

    this.handler.pushFlow(PendingFlow);
    this.handler.nextStep();
  }

  action(user, ...payload) {
    this.handler.action(user, ...payload);
  }

  addPlayer(player) {
    player.logger.info('added to pending room');
    this.playing.add(player);
    this.handler.addedPlayer(player);
  }

  remove(user) {
    this.playing.delete(user);
    this.handler.removedPlayer(user);
  }
}
