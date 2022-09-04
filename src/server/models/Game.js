import _ from 'lodash';
import fs from 'fs';

import Room from './Room.js';

const spirits = fs.readFileSync('src/server/data/spirits.txt').toString('utf8').split(/\r\n|\n/);
const mixer = fs.readFileSync('src/server/data/mixer.txt').toString('utf8').split(/\r\n|\n/);
const cocktail = [...spirits, ...mixer].sort();

const seperator = '-mit-';

export default class Game {
  rooms = [];

  static generateRoomId() {
    const left = _.sample(spirits);
    const right = _(cocktail).without(left).sample();
    return Game.combineParts(left, right);
  }

  static combineParts(left, right) {
    return left + seperator + right;
  }

  static getNameParts() {
    return cocktail;
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
