import _ from 'lodash';
import fs from 'fs';
import { closest } from 'fastest-levenshtein';

import Room from './Room.js';

const names = _(fs.readFileSync('src/server/data/names.txt'))
  .split(/\r\n|\n/)
  .filter((row) => row !== '' && !row.startsWith('#'))
  .value();

const seperator = '-mit-';

export default class Game {
  rooms = [];

  static generateRoomId() {
    const [first, second] = _.sampleSize(names, 2);
    return first + seperator + second;
  }

  createRoom() {
    let roomId;
    do {
      roomId = Game.generateRoomId();
    } while (this.findRoomById(roomId) != null);
    const room = new Room(roomId);
    this.rooms.push(room);
    return room;
  }

  findRoomById(roomId) {
    const [first, second] = roomId.split(seperator);
    const guessedRoomId = closest(first, names) + seperator + closest(second, names);

    return this.rooms.find((room) => room.id === guessedRoomId);
  }

  removeRoom(room) {
    _.pull(this.rooms, room);
  }

  toString() {
    return `Game { rooms = ${this.rooms} }`;
  }
}
