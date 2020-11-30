export default class Vote {
  voted = new Set();
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
    if (this.voted.has(user)) {
      return;
    }

    this.voted.add(user);

    this.card.room.send('vote:update', {
      voted: this.voted.size,
      required: this.getAmountOfRequiredVotes(),
    });

    if (this.voted.size === this.getAmountOfRequiredVotes()) {
      this.callback();
    }
  }

  getAmountOfRequiredVotes() {
    if (this.condition === 'all') {
      return this.card.room.users.length;
    }

    if (this.condition === 'half+one') {
      return Math.floor(this.card.room.users.length / 0.5) + 1;
    }

    return 1;
  }
}
