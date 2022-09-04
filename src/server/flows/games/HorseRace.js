import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import { getDistributedShots } from '../../helper/Shots.js';

import CountdownStep from '../../steps/CountdownStep.js';

const explanation = get('generic', 'game:horserace:explanation');
const results = get('generic', 'game:horserace:results');

const horseStep = 2;
const finishLine = 100;

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanation);

    this.playing.data = {
      button: explanation.data.button,
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
  horses = new Map();

  constructor(room) {
    super(room);

    for (const user of room.playing) {
      this.horses.set(user, 0);
    }

    this.playing.card = 'HorseRaceGame';
    this.playing.data = {
      track: {
        distance: 0,
      },
    };

    this.spectating.card = 'HorseRaceGameResults';
    this.spectating.data = {
      tracks: [...this.horses].map((horse) => ({
        distance: horse[1],
      })),
    };

    this.send();
  }

  removedPlayer(user) {
    this.horses.delete(user);

    this.spectating.data = {
      tracks: [...this.horses].map((horse) => ({
        distance: horse[1],
      })),
    };

    this.send();
  }

  action(user) {
    const distance = this.horses.get(user) + horseStep;
    this.horses.set(user, distance);

    this.players[user.id].data = {
      track: {
        distance,
      },
    };

    this.spectating.data = {
      tracks: [...this.horses].map((horse) => ({
        distance: horse[1],
      })),
    };

    this.send();

    if (distance >= finishLine) {
      setImmediate(() => this.room.handler.next({ horses: this.horses }));
    }
  }
}

class ResultsStep extends Step {
  constructor(room, { horses }) {
    super(room);

    const winner = _.maxBy([...horses], '1')[0].name;
    const tracks = _.chain([...horses])
      .sortBy((horse) => horse[1])
      .reverse()
      .map((horse) => ({
        distance: horse[1],
        name: horse[0].name,
      }))
      .value();

    this.global.card = 'HorseRaceGameResults';
    this.global.data = {
      tracks,
      ...template(results, {
        winner,
        shots: getDistributedShots(),
      }),
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
