import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';
import CountdownStep from '../../steps/CountdownStep.js';

const explanationText = get('generic', 'boxbuilder:explanation');
const gameText = get('generic', 'boxbuilder:game');
const resultsText = get('generic', 'boxbuilder:results');

const columns = 5;
const rows = 5;

const positions = new Array(columns * rows).fill(null).map((value, index) => index);

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    this.shots = generateShots(3, 6);

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanationText, { shots: this.shots });

    this.playing.data = {
      button: explanationText.data.button,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next({ shots: this.shots });
  }

  action(user) {
    this.vote.submit(user);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class PatternInstructionStep extends Step {
  constructor(room) {
    super(room);

    this.pattern = new Array(columns * rows).fill(false);

    const boxes = _.sampleSize(positions, 5);

    for (const box of boxes) {
      this.pattern[box] = true;
    }

    this.global.card = 'BoxesCard';
    this.global.data = {
      rows,
      columns,
      options: this.pattern.map((value, index) => ({
        key: index,
        value: value ? 'primary' : 'dark',
      })),
    };

    this.send();

    this.timeout = setTimeout(this.showText.bind(this), 1000);
  }

  showText() {
    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(gameText),
    };

    this.send();

    this.timeout = setTimeout(this.nextStep.bind(this), 1000);
  }

  nextStep() {
    this.room.handler.next({ pattern: this.pattern });
  }

  stop() {
    clearTimeout(this.timeout);
  }
}

class PatternGuessStep extends Step {
  grids = new Map();

  constructor(room, { pattern }) {
    super(room);
    this.pattern = pattern;

    for (const player of room.playing) {
      const grid = new Array(columns * rows).fill(false);
      this.grids.set(player, grid);

      this.players[player.id].data = {
        options: grid.map((value, index) => ({
          key: index,
          value: value ? 'primary' : 'dark',
        })),
      };
    }

    this.global.card = 'BoxesCard';
    this.global.data = {
      rows,
      columns,
    };

    this.send();
  }

  action(user, payload) {
    const grid = this.grids.get(user);
    grid[payload] = !grid[payload];
    this.players[user.id].data = {
      options: grid.map((value, index) => ({
        key: index,
        value: value ? 'primary' : 'dark',
      })),
    };

    this.send();

    if (_.isEqual(this.pattern, grid)) {
      this.room.handler.next({ grids: this.grids, pattern: this.pattern, winner: user });
    }
  }

  removedPlayer(player) {
    this.grids.delete(player);
  }
}

class ResultsStep extends Step {
  constructor(room, { grids, pattern, winner }) {
    super(room);

    const results = [...grids.entries()].map(([user, grid]) => [
      user,
      grid.reduce((count, cell, index) => count + (cell !== pattern[index]), 0),
    ]);

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        winner: winner.name,
      }),
      options: results.map((result) => ({ key: result[0].id, value: result[0].name, result: `${result[1]} Fehler` })),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  CountdownStep,
  PatternInstructionStep,
  PatternGuessStep,
  ResultsStep,
];
