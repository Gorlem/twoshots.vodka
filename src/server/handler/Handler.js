export default class Handler {
  flows = [];
  current;
  step;

  constructor(target, callback) {
    this.target = target;
    this.callback = callback;
  }

  pushFlow(flow) {
    this.flows.push([...flow]);
  }

  nextFlow(data) {
    this.current = this.flows.shift();
    this.nextStep(data);
  }

  nextStep(data) {
    let Step = this.current?.shift();

    if (Step == null) {
      if (this.flows.length > 0) {
        this.nextFlow();
        return;
      }

      this.callback();
      return;
    }

    if (Step.when != null && Step.then != null) {
      if (!Step.when(data)) {
        this.nextStep(data);
        return;
      }

      Step = Step.then;
    }

    this.step = new Step(this, this.target, data);
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
}
