import { randomInt } from "crypto";

import { Room } from "./room.js";

class Game {
    rooms = [];

    generateRoomId() {
        return randomInt(1000000).toString().padStart(6, "0");
    }

    createRoom() {
        const roomId = this.generateRoomId();
        const room = new Room(roomId);
        this.rooms.push(room);
        return room;
    }

    findRoomById(roomId) {
        return this.rooms.find(room => room.roomId === roomId);
    }

    toString() {
        return `Game { rooms = ${this.rooms} }`;
    }
}

export {
    Game
}