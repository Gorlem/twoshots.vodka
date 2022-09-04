import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { getSelfShots } from '../../helper/Shots.js';
import { get, template, keys } from '../../texts.js';
import Cache from '../../models/Cache.js';

const voteText = get('generic', 'would-you-rather:vote');
const tieText = get('generic', 'would-you-rather:tie');
const sameText = get('generic', 'would-you-rather:same');
const resultsSingleText = get('generic', 'would-you-rather:results/single');
const resultsMultipleText = get('generic', 'would-you-rather:results/multiple');

class VoteStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.would == null) {
      room.cache.would = new Cache(keys('would-you-rather'));
    }

    const key = room.cache.would.get();
    this.options = get('would-you-rather', key);

    this.global.card = 'PollCard';
    this.global.data = {
      ...template(voteText),
      options: [
        { key: 'left', value: this.options[0] },
        { key: 'right', value: this.options[1] },
      ],
    };

    this.spectating.data = {
      selected: true,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next({ results: this.vote.results, options: this.options });
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
  constructor(room, { results, options }) {
    super(room);

    const counts = _.countBy([...results], '1');
    _.defaults(counts, { left: 0, right: 0 });

    this.global.card = 'InformationCard';

    if (counts.left === 0 || counts.right === 0) {
      this.global.data = {
        ...template(sameText, {
          option: counts.left === 0 ? options[1] : options[0],
          shots: getSelfShots(),
        }),
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

      const text = losers.length === 1 ? resultsSingleText : resultsMultipleText;

      this.global.data = {
        ...template(text, {
          option: counts.left < counts.right ? options[1] : options[0],
          losers: losers.join('*, *'),
          shots: getSelfShots(),
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
