import { randomInt } from 'crypto';

import Room from '../models/Room.js';

export default class Game {
  rooms = [];

  static generateRoomId() {
    return randomInt(1000000).toString().padStart(6, '0');
  }

  createRoom() {
    const roomId = Game.generateRoomId();
    const room = new Room(roomId);
    this.rooms.push(room);
    return room;
  }

  findRoomById(roomId) {
    return this.rooms.find((room) => room.id === roomId);
  }

  toString() {
    return `Game { rooms = ${this.rooms} }`;
  }
}
