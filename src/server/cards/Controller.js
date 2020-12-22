export default class Controller {
  room = null;
  step = null;

  constructor(room) {
    this.room = room;
  }

  setStep(step) {
    this.step = step;
  }

  action(user, payload) {
    this.step?.action?.(user, payload);
  }

  addedUser(user) {
    this.step?.addedUser?.(user);
  }

  removedUser(user) {
    this.step?.removedUser?.(user);
  }

  toString() {
    return `${this.constructor.name} = { data = ${this.data} }`;
  }
}
