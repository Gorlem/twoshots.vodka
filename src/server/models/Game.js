import _ from 'lodash';
import fs from 'fs';

import Room from './Room.js';

const names = _(fs.readFileSync('src/server/data/names.txt'))
  .split(/\r\n|\n/)
  .filter((row) => row !== '' && !row.startsWith('#'))
  .value();

const seperator = '-mit-';

export default class Game {
  rooms = [];

  static generateRoomId() {
    return Game.combineParts(..._.sampleSize(names, 2));
  }

  static combineParts(left, right) {
    return left + seperator + right;
  }

  static getNameParts() {
    return names;
  }

  createRoom() {
    let roomId;
    do {
      roomId = Game.generateRoomId();
    } while (this.findRoomById(roomId) != null);
    const room = new Room(roomId);
    room.game = this;
    this.rooms.push(room);

    return room;
  }

  findRoomById(roomId) {
    return this.rooms.find((room) => room.id === roomId);
  }

  removeRoom(room) {
    room.game = null;
    _.pull(this.rooms, room);
  }

  toString() {
    return `Game { rooms = ${this.rooms} }`;
  }
}
