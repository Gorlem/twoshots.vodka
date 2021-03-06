export default class Handler {
  flows = [];
  current;
  step;

  constructor(target, callback) {
    this.target = target;
    this.callback = callback || (() => {});
  }

  clear() {
    this.flows = [];
    this.current = null;
    this.step = null;
  }

  pushFlow(flow) {
    this.flows.push([...flow]);
  }

  pushListener(listener) {
    this.pushFlow([
      class {
        constructor(handler, target, data) {
          setImmediate(() => listener(data));
        }
      },
    ]);
  }

  setRedirect(handler) {
    this.clear();
    this.step = handler;
  }

  nextFlow(data) {
    this.current = this.flows.shift();
    this.nextStep(data);
  }

  nextStep(data) {
    let Step = this.current?.shift();

    if (Step == null) {
      if (this.flows.length > 0) {
        this.nextFlow(data);
        return;
      }

      this.callback(data);
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
