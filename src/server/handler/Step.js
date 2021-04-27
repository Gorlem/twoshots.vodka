import _ from 'lodash';

const dirty = Symbol('dirty');

export default class Step {
  static proxy() {
    return new Proxy({ [dirty]: false }, {
      set(target, property, value) {
        if (property !== dirty) {
          Reflect.set(target, dirty, true);
        }

        return Reflect.set(target, property, value);
      },
    });
  }

  global = Step.proxy();
  spectating = Step.proxy();
  playing = Step.proxy();

  players = new Proxy({}, {
    get(target, property) {
      if (!Reflect.has(target, property)) {
        Reflect.set(target, property, Step.proxy());
      }

      return Reflect.get(target, property);
    },
  });

  constructor(room) {
    this.room = room;
  }

  send() {
    if (this.global[dirty]) {
      this.updateAll();
      this.global[dirty] = false;
    } else {
      if (this.spectating[dirty]) {
        this.updateSpectators();
        this.spectating[dirty] = false;
      }

      if (this.playing[dirty]) {
        this.updatePlayers();
        this.playing[dirty] = false;
      } else {
        for (const user of this.room.playing) {
          if (this.players[user.id][dirty]) {
            this.updatePlayer(user);
            this.players[user.id][dirty] = false;
          }
        }
      }
    }
  }

  updateAll() {
    this.updatePlayers();
    this.updateSpectators();
  }

  updateSpectators() {
    const { card, data } = _.defaultsDeep({}, this.spectating, this.global);
    for (const user of this.room.spectating) {
      user.sendCard(card, data);
    }
  }

  updatePlayers() {
    for (const player of this.room.playing) {
      this.updatePlayer(player);
    }
  }

  updatePlayer(user) {
    const { card, data } = _.defaultsDeep({}, this.players[user.id], this.playing, this.global);
    console.log(card, data);
    user.sendCard(card, data);
  }

  addedSpectator(user) {
    const { card, data } = _.defaultsDeep({}, this.spectating, this.global);
    user.sendCard(card, data);
  }
}
