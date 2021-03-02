import Handler from '../handler/Handler.js';

export default class User {
  id = '';
  name = '';
  role = '';

  handler = new Handler(this);
  socket = null;

  constructor(socket) {
    this.socket = socket;
    this.id = socket.id;
  }

  sendCard(name, data) {
    this.send('card', name, data);
  }

  send(channel, ...args) {
    this.socket.emit(channel, ...args);
  }

  on(channel, callback) {
    this.socket.on(channel, callback);
  }

  once(channel, callback) {
    this.socket.once(channel, callback);
  }

  off(channel) {
    this.socket.removeAllListeners(channel);
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
    };
  }

  toString() {
    return `User { id = ${this.id}, name = ${this.name} }`;
  }
}
