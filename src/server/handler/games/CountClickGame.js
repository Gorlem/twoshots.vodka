import _ from 'lodash';

import Step from '../Step.js';
import StepWithVote from '../StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';
import CountdownStep from '../CountdownStep.js';

const explanationText = get('generic', 'countclick:explanation');
const gameText = get('generic', 'countclick:game');
const finishedText = get('generic', 'countclick:finished');
const resultsText = get('generic', 'countclick:results');

const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

class ExplanationStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    this.shots = generateShots(3, 6);

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanationText, { shots: this.shots });

    this.playing.data = {
      button: explanationText.data.button,
    };

    this.update();
  }

  nextStep() {
    this.handler.nextStep({ shots: this.shots });
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

  constructor(handler, room, { shots }) {
    super(room);
    this.handler = handler;
    this.shots = shots;

    this.numbers = numbers.map((number, i) => ({
      key: i,
      value: number,
      x: Math.random(),
      y: Math.random(),
    }));

    this.global.card = 'CanvasCard';
    this.global.data = {
      ...template(gameText),
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
        this.handler.nextStep({ finished: this.finished, shots: this.shots });
      }
    }
  }

  removedPlayer(player) {
    this.finished.delete(player);
  }
}

class ResultsStep extends Step {
  constructor(handler, room, { finished, shots }) {
    super(room);
    this.handler = handler;

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
        shots,
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
