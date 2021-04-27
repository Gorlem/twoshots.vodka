import _ from 'lodash';

export default class UserCollection {
  users = new Set();

  constructor(users) {
    if (users != null) {
      this.users = new Set([...users]);
    }
  }

  add(user) {
    this.users.add(user);
  }

  remove(user) {
    this.users.delete(user);
  }

  has(user) {
    return this.users.has(user);
  }

  except(...users) {
    return new UserCollection(_.without([...this.users], ...users));
  }

  sendCard(name, data) {
    for (const user of this.users) {
      user.sendCard(name, data);
    }
  }

  sendData(data) {
    for (const user of this.users) {
      user.sendData(data);
    }
  }

  send(channel, ...args) {
    for (const user of this.users) {
      user.send(channel, ...args);
    }
  }

  [Symbol.iterator]() {
    return this.users[Symbol.iterator];
  }
}
