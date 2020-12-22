import _ from 'lodash';

export default class UserCollection {
  users = new Set();
  listeners = new Map();

  constructor(users) {
    if (users != null) {
      this.users = new Set([...users]);
    }
  }

  add(user) {
    this.users.add(user);

    for (const [channel, listener] of this.listeners.entries()) {
      user.on(channel, (...args) => listener(user, ...args));
    }
  }

  remove(user) {
    this.users.delete(user);

    for (const channel of this.listeners.keys()) {
      user.off(channel);
    }
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

  on(channel, callback) {
    this.listeners.set(channel, callback);
    for (const user of this.users) {
      user.on(channel, (...args) => callback(user, ...args));
    }
  }

  off(channel) {
    this.listeners.delete(channel);
    for (const user of this.users) {
      user.off(channel);
    }
  }
}
