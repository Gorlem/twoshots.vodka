import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';
import CountdownStep from '../../steps/CountdownStep.js';

const explanationText = get('generic', 'countclick:explanation');
const gameText = get('generic', 'countclick:game');
const finishedText = get('generic', 'countclick:finished');
const resultsText = get('generic', 'countclick:results');

const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanationText);

    this.playing.data = {
      button: explanationText.data.button,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next();
  }

  action(user) {
    this.vote.submit(user);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class GameStep extends Step {
  finished = new Map();

  constructor(room) {
    super(room);

    this.numbers = numbers.map((number, i) => ({
      key: i,
      value: number,
      x: Math.random(),
      y: Math.random(),
      size: 4,
    }));

    this.global.card = 'CanvasCard';
    this.global.data = {
      ...template(gameText),
    };

    this.spectating.data = {
      options: [...this.numbers],
    };

    for (const player of room.playing) {
      this.players[player.id].data = {
        options: [...this.numbers],
      };
    }

    this.send();

    this.start = Date.now();
  }

  action(user, payload) {
    const { options } = this.players[user.id].data;

    if (options[0].key === payload) {
      options.shift();
      this.players[user.id].data = { options };
    } else {
      this.players[user.id].data = {
        options: [...this.numbers],
      };
    }
    this.send();

    if (options.length === 0) {
      this.finished.set(user, Date.now() - this.start);

      this.players[user.id].card = 'InformationCard';
      this.players[user.id].data = {
        ...template(finishedText, {
          rank: this.finished.size,
        }),
      };
      this.send();

      if (this.finished.size === this.room.playing.size) {
        this.room.handler.next({ finished: this.finished });
      }
    }
  }

  removedPlayer(player) {
    this.finished.delete(player);
  }
}

class ResultsStep extends Step {
  constructor(room, { finished }) {
    super(room);

    const results = _(finished)
      .entries()
      .orderBy('1', 'asc');

    const winner = results.first()[0].name;
    const loser = results.last()[0].name;

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        winner,
        loser,
        shots: generateShots(1, 5),
      }),
      options: results.map((r) => ({
        key: r[0].id,
        value: r[0].name,
        result: `${(r[1] / 1000).toLocaleString('de-DE')} Sekunden`,
      })),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  CountdownStep,
  GameStep,
  ResultsStep,
];
