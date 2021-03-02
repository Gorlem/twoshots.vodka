import _ from 'lodash';

import Vote from '../models/Vote.js';

import { get, template } from '../texts.js';

const voteText = get('generic', 'pending:vote');
const votingText = get('generic', 'pending:voting');
const votedText = get('generic', 'voted');

const yesText = get('generic', 'pending:yes');
const noText = get('generic', 'pending:no');

class VoteStep {
  constructor(handler, room) {
    this.handler = handler;
    this.room = room;
    this.player = room.pending.users.values().next().value;
    room.pending.remove(this.player);

    this.vote = new Vote(this.room, () => {
      handler.nextStep({ player: this.player, results: this.vote.results });
    });

    this.sendCard();
    this.player.sendCard('InformationCard', votingText);
  }

  sendCard() {
    for (const user of this.room.playing.users) {
      user.sendCard('PollCard', {
        ...template(voteText, { pending: this.player.name }),
        ...template(votedText, { ...this.vote.data() }),
        ...voteText.data,
        selected: this.vote.results.has(user) ? this.vote.results.get(user) : null,
      });
    }
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.sendCard();
  }
}

class ResultStep {
  constructor(handler, room, { player, results }) {
    const counts = _.countBy([...results], '1');

    _.defaults(counts, { yes: 0, no: 0 });

    if (counts.yes > counts.no) {
      room.addPlayer(player);
      room.playing.sendCard('InformationCard', {
        ...template(yesText, { player: player.name }),
      });
    } else {
      room.playing.sendCard('InformationCard', {
        ...template(noText, { player: player.name }),
      });
    }
  }
}

export default [
  VoteStep,
  ResultStep,
];
