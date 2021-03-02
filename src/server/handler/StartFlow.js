import Game from '../models/Game.js';
import { get, template } from '../texts.js';

const startText = get('generic', 'start');

class StartStep {
  constructor(handler, user) {
    this.handler = handler;

    user.sendCard('StartCard', {
      ...startText.data,
      ...template(startText),
      names: Game.getNameParts(),
    });
  }

  action(user, left, right) {
    if (left == null && right == null) {
      this.handler.nextStep({ roomId: null });
    } else {
      const roomId = Game.combineParts(left, right);
      this.handler.nextStep({ roomId });
    }
  }
}

export default [
  StartStep,
];
