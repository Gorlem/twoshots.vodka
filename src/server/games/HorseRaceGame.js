import Card from '../cards/Card.js';

export default class HorseRaceGame extends Card {
  horses = new Map();

  constructor(room) {
    super(room, 'HorseRaceGame');

    for (const user of room.users) {
      this.horses.set(user, 0);
    }
  }

  addedUser(user) {
    this.horses.set(user, 0);
  }

  init() {
    super.init();
    this.room.on('card:game:horse:tap', (user) => {
      const distance = this.horses.get(user) + 1;
      this.horses.set(user, distance);
      user.send('card:game:horse:update', [{ distance, name: '' }]);

      if (distance >= 100) {
        this.room.off('card:game:horse:tap');
        this.room.send('card:game:horse:update', Array.from(this.horses, (horse) => ({ distance: horse[1], name: horse[0].name })));
      }
    });
  }
}
