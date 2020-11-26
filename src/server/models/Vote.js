export default class Vote {
  voted = [];
  users = 0;

  condition = '';

  constructor(condition) {
    this.condition = condition;
  }

  updateTotalUsers(users) {
    this.users = users;
  }

  vote(user) {
    if (user in this.voted) {
      return;
    }

    this.voted.push(user);
  }

  isConditionReached() {
    if (this.condition === 'all') {
      return this.voted.length === this.users;
    }

    if (this.condition === 'half+one') {
      return this.voted.length / this.users > 0.5;
    }

    return false;
  }
}
