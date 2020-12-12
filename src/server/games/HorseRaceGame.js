import _ from 'lodash';

import GameCard from '../cards/GameCard.js';

export default class HorseRaceGame extends GameCard {
  horses = new Map();

  constructor(room) {
    super(room, 'HorseRaceGame');

    for (const user of room.players) {
      this.horses.set(user, 0);
    }
  }

  startGame() {
    super.startGame();
    this.room.send('card:data', {
      tracks: [{ distance: 0, name: '' }],
    });
  }

  removedUser(user) {
    super.removedUser();
    this.horses.delete(user);
  }

  gameAction(user) {
    const distance = this.horses.get(user) + 1;
    this.horses.set(user, distance);
    this.sendUserData(user);

    if (distance >= 100) {
      const winner = _.maxBy([...this.horses], '1');

      this.finishGame(winner[0].name);
      this.sendGameData();
    }
  }

  sendGameData() {
    this.room.send('card:data', {
      ...this.data,
      tracks: Array.from(this.horses, (horse) => ({ distance: horse[1], name: horse[0].name })),
    });
  }

  sendUserData(user) {
    const distance = this.horses.get(user);
    user.send('card:data', {
      tracks: [{ distance, name: '' }],
    });
  }
}
