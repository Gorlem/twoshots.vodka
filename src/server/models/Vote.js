export default class Vote {
  results = new Map();
  room = null;
  percentage = 100;
  minimum = 1;
  callback = null;

  constructor(room, callback) {
    this.room = room;
    this.callback = callback;
  }

  data() {
    return {
      voted: this.results.size,
      required: this.getAmountOfRequiredVotes(),
    };
  }

  submit(user, data) {
    if (this.results.has(user)) {
      return;
    }

    this.results.set(user, data);

    this.checkCondition();
  }

  reset() {
    this.results.clear();
  }

  removedUser(user) {
    this.results.delete(user);

    this.checkCondition();
  }

  setPercentage(percentage) {
    this.percentage = percentage;
  }

  setMinimum(minimum) {
    this.minimum = minimum;
  }

  checkCondition() {
    if (this.isConditionReached()) {
      setImmediate(() => this.callback());
    }
  }

  isConditionReached() {
    return this.results.size >= this.getAmountOfRequiredVotes();
  }

  getAmountOfRequiredVotes() {
    return Math.max(Math.ceil(this.room.playing.users.size * (this.percentage / 100)), this.minimum);
  }
}
