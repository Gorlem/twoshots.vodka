export default class Room {
  users = []
  id = ''
  vote = null

  constructor(id) {
    this.id = id;
  }

  join(user) {
    if (user.room != null) {
      return false;
    }

    this.users.push(user);

    return true;
  }

  leave(user) {
    const index = this.users.indexOf(user);

    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);

    return true;
  }

  toString() {
    return `Room { id = ${this.id}, users = ${this.users} }`;
  }
}
