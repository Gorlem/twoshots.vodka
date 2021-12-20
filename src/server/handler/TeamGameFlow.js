import _ from 'lodash';

import RockPaperScissor from './teams/RockPaperScissorGame.js';
import DefendCastle from './teams/DefendCastleGame.js';

const games = [
  RockPaperScissor,
  DefendCastle,
];

class GameStep {
  constructor(handler, room) {
    if (room.cache.teamgames == null || room.cache.teamgames.length === 0) {
      room.cache.teamgames = _.shuffle([...games]);
    }

    const game = room.cache.teamgames.shift();

    const half = Math.ceil(room.playing.size / 2);
    const left = _.sampleSize([...room.playing], half);
    const right = _.without([...room.playing], ...left);

    setImmediate(() => {
      handler.pushFlow(game);
      handler.nextFlow({ left, right });
    });
  }
}

export default [
  GameStep,
];
