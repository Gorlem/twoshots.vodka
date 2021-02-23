import HorseRaceGame from './games/HorseRaceGame.js';

const games = [
  HorseRaceGame,
];

class GameStep {
  constructor(handler, room) {
    if (room.cache.games == null || room.cache.games.length === 0) {
      room.cache.games = [...games];
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
