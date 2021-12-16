import _ from 'lodash';

import { get, template } from '../texts.js';

const waitingText = get('generic', 'pending:waiting');
const votingText = get('generic', 'pending:voting');

class WaitingStep {
  constructor(handler, user) {
    user.sendCard('InformationCard', template(waitingText));
  }
}

class VotingStep {
  constructor(handler, user) {
    this.user = user;

    this.seating = _.flatMap(user.room.seating, (player, i) => [
      { key: i, value: 'Freier Platz 🪑' },
      { key: player.id, value: player.name, static: true },
    ]);

    user.sendCard('CarouselCard', {
      ...template(votingText),
      options: this.seating,
    });
  }

  action(player, payload) {
    this.user?.room?.handler?.step?.setSeat?.(payload);

    this.seating = _.flatMap(this.user.room.seating, (p, i) => [
      { key: i, value: i === payload ? this.user.name : 'Freier Platz 🪑', static: i === payload },
      { key: p.id, value: p.name, static: true },
    ]);

    this.user.sendCard('CarouselCard', {
      ...template(votingText),
      options: this.seating,
    });
  }
}

export default [
  WaitingStep,
  VotingStep,
];
