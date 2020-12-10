export default class User {
  id = '';
  name = '';

  socket = null;

  constructor(socket) {
    this.socket = socket;
    this.id = socket.id;
  }

  sendCard(name, data) {
    this.send('card:name', name);
    this.send('card:data', data);
  }

  sendData(data) {
    this.send('card:data', data);
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
