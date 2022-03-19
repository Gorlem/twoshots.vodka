export default class User {
  id = '';
  name = '';
  role = '';
  socket = null;

  constructor(socket) {
    this.socket = socket;
    this.id = socket.id;
  }

  sendCard(name, data) {
    this.send('room/card', { name, data });
  }

  send(channel, ...args) {
    this.socket.emit(channel, ...args);
  }

  toString() {
    return `User { id = ${this.id}, name = ${this.name} }`;
  }
}
