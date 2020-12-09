export default class Vote {
  results = new Map();
  room = null;
  condition = 'half+one';
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

  setCondition(condition) {
    this.condition = condition;
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
    if (this.condition === 'all') {
      return Math.max(this.room.users.length, this.minimum);
    }

    if (this.condition === 'half+one') {
      return Math.max(Math.floor(this.room.users.length / 2) + 1, this.minimum);
    }

    return this.minimum;
  }
}
