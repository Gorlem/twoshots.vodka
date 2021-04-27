import _ from 'lodash';

import Step from '../Step.js';
import StepWithVote from '../StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';

const explanation = get('generic', 'game:horserace:explanation');
const results = get('generic', 'game:horserace:results');

const horseStep = 2;
const finishLine = 100;

class ExplanationStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanation);

    this.playing.data = {
      button: explanation.data.button,
    };

    this.update();
  }

  nextStep() {
    this.handler.nextStep();
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

  constructor(handler, room) {
    super(room);
    this.handler = handler;

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
      setImmediate(() => this.handler.nextStep({ horses: this.horses }));
    }
  }
}

class ResultsStep extends Step {
  constructor(handler, room, { horses }) {
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

    const shots = generateShots(3, 6);

    this.global.card = 'HorseRaceGameResults';
    this.global.data = {
      tracks,
      ...template(results, { winner, shots }),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultsStep,
];
