import FlowDirector from './FlowDirector.js';

export default class Handler {
  director = new FlowDirector();

  flows = [];
  flow;
  step;

  room;
  listener;

  constructor(room) {
    this.room = room;
  }

  addListener(listener) {
    this.listener = listener;
  }

  pushFlow(flow) {
    this.flows.push([...flow]);
  }

  forceFlow(flowName) {
    const flow = this.director.getFlowByName(flowName);

    if (flow != null) {
      this.pushFlow(flow);
      this.skip();
    }
  }

  skip() {
    if (this.flows.length === 0) {
      this.pushFlow(this.director.getNextFlow());
    }

    this.flow = this.flows.shift();

    this.listener?.();

    this.next();
  }

  next(data) {
    const Step = this.flow?.shift();

    if (Step == null) {
      this.skip();
      return;
    }

    this.step?.stop?.();

    this.step = new Step(this.room, data);
  }

  action(user, ...payload) {
    this.step?.action?.(user, ...payload);
  }

  addedPlayer(user) {
    this.step?.addedPlayer?.(user);
  }

  removedPlayer(user) {
    this.step?.removedPlayer?.(user);
  }

  addedSpectator(user) {
    this.step?.addedSpectator?.(user);
  }

  removedSpectator(user) {
    this.step?.removedSpectator?.(user);
  }
}
