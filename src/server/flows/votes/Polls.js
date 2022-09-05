import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import { getDistributedShots, getSelfShots } from '../../helper/Shots.js';
import Cache from '../../models/Cache.js';

class PollStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.polls == null) {
      room.cache.polls = new Cache(keys('polls'));
    }

    const key = room.cache.polls.get();

    this.poll = get('polls', key);

    this.sendPoll([...this.room.playing]);
  }

  sendPoll(users) {
    const options = users.map((user) => ({ key: user.name, value: user.name }));

    this.global.card = 'PollCard';
    this.global.data = {
      title: this.poll.title,
      options,
    };

    this.spectating.data = {
      selected: true,
    };

    this.update();
  }

  nextStep() {
    const counts = _.countBy([...this.vote.results], '1');
    const max = _.max(_.values(counts));

    const winner = _(counts)
      .entries()
      .filter((count) => count[1] === max)
      .value();

    console.log(winner);

    if (winner.length > 1) {
      this.vote.reset();

      for (const player of this.room.playing) {
        this.players[player.id].data = {};
      }

      this.sendPoll(winner.map((entry) => ({ name: entry[0] })));
    } else {
      this.room.handler.next({ poll: this.poll, counts, winner: winner[0] });
    }
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
  constructor(room, { poll, counts, winner }) {
    super(room);

    const messageIndex = _.random(0, 1);

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template({
        message: poll.message[messageIndex],
        title: poll.title,
      }, {
        shots: messageIndex === 0 ? getSelfShots() : getDistributedShots(),
        winner: winner[0],
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
