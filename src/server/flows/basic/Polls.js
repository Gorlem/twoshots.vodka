import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import generateShots from '../../shots.js';
import Cache from '../../models/Cache.js';

class PollStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.polls == null) {
      room.cache.polls = new Cache(keys('polls'));
    }

    const key = room.cache.polls.get();

    this.poll = get('polls', key);

    this.title = this.poll.title;
    this.users = [...room.playing].map((user) => ({ key: user.name, value: user.name }));

    this.global.card = 'PollCard';
    this.global.data = {
      title: this.poll.title,
      options: this.users,
    };

    this.spectating.data = {
      selected: true,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next({ poll: this.poll, results: this.vote.results });
  }

  action(user, payload) {
    this.vote.submit(user, payload);

    this.players[user.id].data = {
      selected: payload,
    };

    this.update();
  }
}

class ResultStep extends Step {
  constructor(room, { poll, results }) {
    super(room);

    const counts = _.countBy([...results], '1');
    const max = _.max(_.values(counts));

    const winner = _(counts)
      .entries()
      .filter((count) => count[1] === max)
      .head()[0];

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template({
        message: _.sample(poll.message),
        title: poll.title,
      }, {
        shots: generateShots(1, 5),
        winner,
      }),
      options: _.entries(counts).map((e) => ({
        key: e[0],
        value: e[0],
        result: `${e[1]}x ☝`,
      })),
    };

    this.send();
  }
}

export default [
  PollStep,
  ResultStep,
];
