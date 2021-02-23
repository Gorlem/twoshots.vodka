import _ from 'lodash';

import Vote from '../../models/Vote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';

class ExplanationStep {
  constructor(handler, room) {
    this.room = room;

    this.vote = new Vote(this.room, () => {
      handler.nextStep();
    });

    const content = get('generic', 'game:horserace:explanation');
    this.data = template(content);

    this.sendCard();
  }

  sendCard() {
    this.room.playing.sendCard('ConfirmationCard', {
      ...this.data,
      vote: this.vote.data(),
    });
  }

  action(user) {
    this.vote.submit(user);
    this.sendCard();
  }

  removedUser(user) {
    this.vote.removedUser(user);
    this.sendCard();
  }
}

class GameStep {
  horses = new Map();

  constructor(handler, room) {
    this.room = room;
    this.handler = handler;

    for (const user of room.playing.users) {
      this.horses.set(user, 0);
    }

    this.room.playing.sendCard('HorseRaceGame', {
      track: {
        distance: 0,
      },
    });
  }

  removedUser(user) {
    this.horses.delete(user);
  }

  action(user) {
    const distance = this.horses.get(user) + 10;
    this.horses.set(user, distance);

    user.sendCard('HorseRaceGame', {
      track: {
        distance,
      },
    });

    if (distance >= 100) {
      setImmediate(() => this.handler.nextStep({ horses: this.horses }));
    }
  }
}

class ResultsStep {
  constructor(handler, room, { horses }) {
    const winner = _.maxBy([...horses], '1')[0].name;
    const tracks = _.chain([...horses])
      .sortBy((horse) => horse[1])
      .reverse()
      .map((horse) => ({
        distance: horse[1],
        name: horse[0].name,
      }))
      .value();

    const content = get('generic', 'game:horserace:results');
    const shots = generateShots(3, 6);

    room.playing.sendCard('HorseRaceGameResults', {
      tracks,
      ...template(content, { winner, shots }),
    });
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultsStep,
];
