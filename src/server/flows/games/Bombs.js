import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';

const explanation = get('generic', 'game:bomb:explanation');
const results = get('generic', 'game:bomb:results');
const hasBomb = get('generic', 'game:bomb:has-bomb');
const waiting = get('generic', 'game:bomb:waiting');
const spectator = get('generic', 'game:bomb:spectator');

const fuseTime = [15000, 30000]; // between 15 and 30 seconds

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    this.shots = generateShots(3, 6);

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanation, { shots: this.shots });

    this.playing.data = {
      button: explanation.data.button,
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

class GameStep extends Step {
  current;
  seating;

  constructor(room, { shots }) {
    super(room);

    this.seating = [...room.seating];

    this.playing.card = 'InformationCard';
    this.spectating.card = 'CarouselCard';
    this.spectating.data = {
      ...template(spectator),
      selected: true,
    };

    this.giveBomb(_.sample(this.seating));

    setTimeout(() => {
      room.handler.next({ loser: this.current, shots });
    }, _.random(...fuseTime));
  }

  giveBomb(player) {
    if (player === null) {
      return;
    }

    if (this.current != null) {
      this.players[this.current.id].card = undefined;
      this.players[this.current.id].data = undefined;
    }

    this.players[player.id].card = 'PollCard';
    this.players[player.id].data = {
      ...hasBomb,
      ...template(hasBomb),
    };

    this.playing.data = template(waiting, { bomb: player.name });

    this.spectating.data = {
      ...this.spectating.data,
      options: this.seating.map((user) => ({ key: user.id, value: user.name + (user.id === player.id ? ' 💣' : '') })),
    };

    this.current = player;

    this.send();
  }

  removedPlayer(user) {
    _.pull(this.seating, user);

    if (user === this.current) {
      this.giveBomb(_.sample(this.seating));
    }
  }

  action(user, direction) {
    if (user !== this.current) {
      return;
    }

    if (direction === 'random') {
      this.giveBomb(_(this.seating).without(user).sample());
    } else {
      let index = this.seating.indexOf(user);
      index += direction === 'left' ? 1 : -1;

      if (index >= this.seating.length) {
        index = 0;
      }

      if (index < 0) {
        index = this.seating.length - 1;
      }

      this.giveBomb(this.seating[index]);
    }
  }
}

class ResultsStep extends Step {
  constructor(room, { loser, shots }) {
    super(room);

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(results, { loser: loser.name, shots }),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultsStep,
];