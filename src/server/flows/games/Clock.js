import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import { getSelfShots, getDistributedShots } from '../../helper/Shots.js';

const explanationText = get('generic', 'clock:explanation');
const gameText = get('generic', 'clock:game');
const resultsText = get('generic', 'clock:results');

const clockTime = [15, 30]; // between 15 and 30 seconds

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

class GameStep extends StepWithVote {
  constructor(room) {
    super(room);

    this.global.card = 'InformationCard';
    this.playing.card = 'ConfirmationCard';

    this.clock = _.random(...clockTime) * 1000;

    this.global.data = {
      ...template(gameText, {
        seconds: (this.clock / 1000).toLocaleString('de-DE'),
      }),
      ...gameText.data,
    };

    this.update();

    this.start = Date.now();
  }

  action(player) {
    this.vote.submit(player, Date.now());

    this.players[player.id].data = {
      selected: true,
    };

    this.update();
  }

  nextStep() {
    const differences = [...this.vote.results]
      .map(([player, time]) => [player, (this.start - time + this.clock) * -1]);

    this.room.handler.next({ differences });
  }
}

class ResultsStep extends Step {
  constructor(room, { differences }) {
    super(room);

    const sorted = _(differences)
      .map(([player, diff]) => [player, Math.abs(diff)])
      .orderBy(['1']);

    const winner = sorted.first()[0].name;
    const loser = sorted.last()[0].name;

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        winner,
        loser,
        distributedShots: getDistributedShots(),
        selfShots: getSelfShots(),
      }),
      options: differences.map(([player, diff]) => ({
        key: player.id,
        value: player.name,
        result: `${(diff / 1000).toLocaleString('de-DE', { signDisplay: 'always' })} Sekunden`,
      })),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultsStep,
];
