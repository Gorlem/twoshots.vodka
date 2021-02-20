export default class Handler {
  constructor(flow, target, callback) {
    this.flow = flow;
    this.target = target;
    this.callback = callback;
  }

  nextStep(data) {
    let NextStep = this.flow.shift();

    if (NextStep == null) {
      this.callback();
      return;
    }

    if (NextStep.when != null && NextStep.then != null) {
      if (!NextStep.when(data)) {
        this.nextStep(data);
        return;
      }

      NextStep = NextStep.then;
    }

    this.step = new NextStep(this, this.target);
  }

  action(user, ...payload) {
    this.step?.action(user, ...payload);
  }
}
