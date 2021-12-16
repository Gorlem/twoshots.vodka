import _ from 'lodash';

import Step from './Step.js';
import StepWithVote from './StepWithVote.js';

import { get, template } from '../texts.js';

const voteText = get('generic', 'pending:vote');
const yesText = get('generic', 'pending:yes');
const noText = get('generic', 'pending:no');

class VoteStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    this.player = room.pending.values().next().value;
    room.pending.delete(this.player);

    this.global.card = 'PollCard';
    this.global.data = {
      ...template(voteText, { pending: this.player.name }),
      ...voteText.data,
    };

    this.update();
    this.player.handler.nextStep();

    this.seat = null;
  }

  nextStep() {
    if (this.seat == null) {
      return;
    }

    this.handler.nextStep({ player: this.player, results: this.vote.results, seat: this.seat });
  }

  action(user, payload) {
    this.vote.submit(user, payload);

    this.players[user.id].data = {
      selected: payload,
    };

    this.update();
  }

  setSeat(seat) {
    this.seat = seat;
    this.vote.checkCondition();
  }
}

class ResultStep extends Step {
  constructor(handler, room, { player, results, seat }) {
    super(room);
    const counts = _.countBy([...results], '1');

    _.defaults(counts, { yes: 0, no: 0 });

    if (counts.yes > counts.no) {
      room.addPlayer(player);
      room.seating.splice(seat, 0, player);

      this.global.card = 'InformationCard';
      this.global.data = {
        ...template(yesText, { player: player.name }),
      };

      this.send();
    } else {
      this.global.card = 'InformationCard';
      this.global.data = {
        ...template(noText, { player: player.name }),
      };

      this.send();
    }
  }
}

export default [
  VoteStep,
  ResultStep,
];
