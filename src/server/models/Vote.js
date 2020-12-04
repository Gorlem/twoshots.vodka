export default class Vote {
  voted = new Map();
  card = null;
  condition = 'half+one';
  minimum = 1;
  callback = null;
  namespace = '';

  constructor(card, namespace, callback) {
    this.card = card;
    this.namespace = namespace;
    this.callback = callback;
  }

  init() {
    this.card.room.on(`${this.namespace}:submit`, this.vote.bind(this));
  }

  destroy() {
    this.card.room.off(`${this.namespace}:submit`);
  }

  update() {
    this.card.room.send(`${this.namespace}:update`, {
      voted: this.voted.size,
      required: this.getAmountOfRequiredVotes(),
    });

    if (this.voted.size >= this.getAmountOfRequiredVotes()) {
      this.callback();
    }
  }

  setCondition(condition) {
    this.condition = condition;
  }

  setMinimum(minimum) {
    this.minimum = minimum;
  }

  removedUser(user) {
    this.voted.delete(user);
  }

  vote(user, data) {
    if (this.voted.has(user)) {
      return;
    }

    this.voted.set(user, data);

    this.update();
  }

  isConditionReached() {
    return this.voted.size >= this.getAmountOfRequiredVotes();
  }

  getAmountOfRequiredVotes() {
    if (this.condition === 'all') {
      return Math.max(this.card.room.users.length, this.minimum);
    }

    if (this.condition === 'half+one') {
      return Math.max(Math.floor(this.card.room.users.length / 2) + 1, this.minimum);
    }

    return this.minimum;
  }
}
