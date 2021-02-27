import _ from 'lodash';

import Vote from '../../models/Vote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';

const voted = get('generic', 'voted');
const explanation = get('generic', 'game:horserace:explanation');
const results = get('generic', 'game:horserace:results');

class ExplanationStep {
  constructor(handler, room) {
    this.room = room;

    this.vote = new Vote(this.room, () => {
      handler.nextStep();
    });

    this.content = {
      ...explanation,
      ...voted,
    };

    this.sendCard();
  }

  sendCard() {
    this.room.playing.sendCard('ConfirmationCard', {
      ...template(this.content, { ...this.vote.data() }),
      button: this.content.data.button,
    });
    this.room.spectating.sendCard('InformationCard', {
      ...template(this.content, { ...this.vote.data() }),
    });
  }

  action(user) {
    this.vote.submit(user);
    this.sendCard();
  }

  removedPlayer(user) {
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
    this.sendSpectator();
  }

  removedPlayer(user) {
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

    this.sendSpectator();

    if (distance >= 100) {
      setImmediate(() => this.handler.nextStep({ horses: this.horses }));
    }
  }

  sendSpectator() {
    this.room.spectating.sendCard('HorseRaceGameResults', {
      tracks: [...this.horses].map((horse) => ({
        distance: horse[1],
      })),
    });
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

    const shots = generateShots(3, 6);

    room.playing.sendCard('HorseRaceGameResults', {
      tracks,
      ...template(results, { winner, shots }),
    });

    room.spectating.sendCard('HorseRaceGameResults', {
      tracks: [...horses].map((horse) => ({
        distance: horse[1],
        name: horse[0].name,
      })),
      ...template(results, { winner, shots }),
    });
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultsStep,
];
