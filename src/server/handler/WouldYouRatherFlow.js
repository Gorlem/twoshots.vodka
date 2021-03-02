import _ from 'lodash';

import Step from './Step.js';

import Vote from '../models/Vote.js';
import generateShots from '../shots.js';
import { get, template, keys } from '../texts.js';

const voteText = get('generic', 'would-you-rather:vote');
const votedText = get('generic', 'voted');

class VoteStep extends Step {
  constructor(handler, room) {
    super(room);

    if (room.cache.would == null || room.cache.would.length === 0) {
      room.cache.would = _.shuffle(keys('would-you-rather'));
    }

    this.vote = new Vote(this.room, () => {
      handler.nextStep({ results: this.vote.results });
    });

    const key = room.cache.would.shift();
    const options = get('would-you-rather', key);

    const shots = generateShots(2, 6);

    this.global.card = 'PollCard';
    this.global.data = {
      ...template(voteText, { shots }),
      ...options,
      ...template(votedText, this.vote.data()),
    };

    this.spectating.data = {
      selected: true,
    };

    this.send();
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.players[user.id].data = {
      selected: payload,
    };
    this.global.data = {
      ...this.global.data,
      ...template(votedText, this.vote.data()),
    };
    this.send();
  }
}

class ResultsStep extends Step {
  constructor(handler, room, { results }) {
    super(room);

    const tieText = get('generic', 'would-you-rather:tie');
    const sameText = get('generic', 'would-you-rather:same');
    const resultsText = get('generic', 'would-you-rather:results');

    const counts = _.countBy([...results], '1');
    _.defaults(counts, { left: 0, right: 0 });

    this.global.card = 'InformationCard';

    if (counts.left === 0 || counts.right === 0) {
      this.global.data = {
        ...template(sameText),
      };
    } else if (counts.left === counts.right) {
      this.global.data = {
        ...template(tieText),
      };
    } else {
      this.global.data = {
        ...template(resultsText),
      };
    }

    this.send();
  }
}

export default [
  VoteStep,
  ResultsStep,
];
