export default class Vote {
  voted = [];
  card = null;
  condition = '';
  callback = null;

  constructor(card, condition, callback) {
    this.card = card;
    this.condition = condition;
    this.callback = callback;

    this.card.room.on('vote', this.vote.bind(this));
  }

  vote(user) {
    if (user in this.voted) {
      return;
    }

    this.voted.push(user);

    if (this.isConditionReached()) {
      this.callback();
    }
  }

  isConditionReached() {
    if (this.condition === 'all') {
      return this.voted.length === this.card.room.users.length;
    }

    if (this.condition === 'half+one') {
      return this.voted.length / this.card.room.users.length > 0.5;
    }

    return false;
  }
}
