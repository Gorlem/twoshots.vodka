export default class User {
  id = '';
  name = '';

  toString() {
    return `User { id = ${this.id}, name = ${this.name} }`;
  }
}
