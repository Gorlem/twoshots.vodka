import _ from 'lodash';

import Step from './Step.js';
import StepWithVote from './StepWithVote.js';

import generateShots from '../shots.js';
import { get, template, keys } from '../texts.js';

const voteText = get('generic', 'would-you-rather:vote');

class VoteStep extends StepWithVote {
  constructor(handler, room) {
    super(room);
    this.handler = handler;

    if (room.cache.would == null || room.cache.would.length === 0) {
      room.cache.would = _.shuffle(keys('would-you-rather'));
    }

    const key = room.cache.would.shift();
    this.options = get('would-you-rather', key);

    this.shots = generateShots(2, 6);

    this.global.card = 'PollCard';
    this.global.data = {
      ...template(voteText, { shots: this.shots }),
      ...this.options,
    };

    this.spectating.data = {
      selected: true,
    };

    this.update();
  }

  nextStep() {
    this.handler.nextStep({ results: this.vote.results, options: this.options.options, shots: this.shots });
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.players[user.id].data = {
      selected: payload,
    };
    this.update();
  }
}

class ResultsStep extends Step {
  constructor(handler, room, { results, options, shots }) {
    super(room);

    const tieText = get('generic', 'would-you-rather:tie');
    const sameText = get('generic', 'would-you-rather:same');
    const resultsText = get('generic', 'would-you-rather:results');

    const counts = _.countBy([...results], '1');
    _.defaults(counts, { left: 0, right: 0 });

    this.global.card = 'InformationCard';

    if (counts.left === 0 || counts.right === 0) {
      this.global.data = {
        ...template(sameText, { option: counts.left === 0 ? options[1].value : options[0].value, shots }),
      };
    } else if (counts.left === counts.right) {
      this.global.data = {
        ...template(tieText),
      };
    } else {
      const losers = _([...results])
        .filter((r) => (r[1] === (counts.left < counts.right ? 'left' : 'right')))
        .map('[0].name')
        .value();
      this.global.data = {
        ...template(resultsText, {
          option: counts.left < counts.right ? options[1].value : options[0].value,
          losers,
          shots,
        }),
      };
    }

    this.send();
  }
}

export default [
  VoteStep,
  ResultsStep,
];
