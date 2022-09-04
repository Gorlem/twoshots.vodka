import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';

const explanationText = get('generic', 'musicalchairs:explanation');
const gameText = get('generic', 'musicalchairs:game');
const startText = get('generic', 'musicalchairs:start');
const outText = get('generic', 'musicalchairs:out');
const resultsText = get('generic', 'musicalchairs:results');

const waitingTime = [1000, 5000];

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
  chairs = [];
  remaining = [];
  timeout = null;

  constructor(room) {
    super(room);

    this.remaining = [...this.room.playing];

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(startText),
    };

    this.spectating.data = {
      selected: true,
    };

    this.send();

    this.timeout = setTimeout(this.setupChairs.bind(this), _.random(...waitingTime));
  }

  stop() {
    clearTimeout(this.timeout);
  }

  setupChairs() {
    this.global.card = 'CarouselCard';
    this.chairs = Array.from(Array(this.remaining.length - 1));
    this.sendChairs();
  }

  sendChairs() {
    this.global.data = {
      ...template(gameText),
      options: this.chairs.map((value, index) => ({
        key: index,
        value: value != null ? value.name : gameText.data.chair,
        static: value != null,
      })),
    };

    this.send();

    this.checkChairs();
  }

  removedPlayer(player) {
    _.pull(this.remaining, player);

    if (this.global.card !== 'CarouselCard') {
      return;
    }

    if (this.chairs.includes(player)) {
      _.pull(this.chairs, player);
    } else {
      const lastEmpty = this.chairs.indexOf(undefined);
      _.pullAt(this.chairs, lastEmpty);
    }

    this.sendChairs();
  }

  checkChairs() {
    if (!this.chairs.some((value) => value == null)) {
      if (this.chairs.length === 0) {
        this.timeout = setTimeout(this.nextStep.bind(this), 100);
      } else if (this.chairs.length === 1) {
        const loser = _.without(this.remaining, ...this.chairs)[0];
        _.pull(this.remaining, loser);
        this.timeout = setTimeout(this.nextStep.bind(this), 100);
      } else {
        this.timeout = setTimeout(this.sendPlayerOut.bind(this), 100);
      }
    }
  }

  sendPlayerOut() {
    const loser = _.without(this.remaining, ...this.chairs)[0];
    _.pull(this.remaining, loser);

    for (const player of this.remaining) {
      this.players[player.id].data = {};
    }

    this.players[loser.id].data = {
      selected: true,
    };

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(outText, {
        player: loser.name,
      }),
    };

    this.send();

    this.timeout = setTimeout(this.setupChairs.bind(this), _.random(...waitingTime));
  }

  nextStep() {
    this.room.handler.next({ winner: this.remaining[0] });
  }

  action(player, index) {
    if (this.chairs[index] == null) {
      this.chairs[index] = player;
      this.players[player.id].data = {
        selected: index,
      };
    }

    this.sendChairs();
  }
}

class ResultsStep extends Step {
  constructor(room, { winner }) {
    super(room);

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(resultsText, {
        winner: winner.name,
        shots: generateShots(1, 5),
      }),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultsStep,
];
