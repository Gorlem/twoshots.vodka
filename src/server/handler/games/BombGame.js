import _ from 'lodash';

import Step from '../Step.js';
import StepWithVote from '../StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';

const explanation = get('generic', 'game:bomb:explanation');
const results = get('generic', 'game:bomb:results');

class ExplanationStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    const shots = generateShots(3, 6);

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanation, { shots });

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
  current;
  seating;

  constructor(handler, room) {
    super(room);
    this.handler = handler;

    this.global.card = 'InformationCard';
    this.global.data = {
      title: 'Puff',
    };

    this.seating = [...room.playing];

    this.giveBomb(_.sample(this.seating));
  }

  giveBomb(player) {
    if (this.current != null) {
      this.players[this.current.id].card = undefined;
      this.players[this.current.id].data = undefined;
    }

    this.players[player.id].card = 'PollCard';
    this.players[player.id].data = {
      options: [
        {
          key: 'left',
          value: '👈 nach links',
        },
        {
          key: 'random',
          value: '🔀 zufällig',
        },
        {
          key: 'right',
          value: 'nach rechts 👉',
        },
      ],
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
      index += direction === 'left' ? -1 : 1;

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
