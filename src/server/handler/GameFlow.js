import _ from 'lodash';

import HorseRaceGame from './games/HorseRaceGame.js';
import BombGame from './games/BombGame.js';

const games = [
  HorseRaceGame,
  BombGame,
];

class GameStep {
  constructor(handler, room) {
    if (room.cache.games == null || room.cache.games.length === 0) {
      room.cache.games = _.shuffle([...games]);
    }

    const game = room.cache.games.shift();

    setImmediate(() => {
      handler.pushFlow(game);
      handler.nextFlow();
    });
  }
}

export default [
  GameStep,
];
