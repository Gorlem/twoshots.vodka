

class Room {
    users = []

    constructor(roomId) {
        this.roomId = roomId;
    }

    join(user) {
        this.users.push(user);
    }

    toString() {
        return `Room { id = ${this.roomId}, users = ${this.users} }`;
    }
}

export {
    Room
}