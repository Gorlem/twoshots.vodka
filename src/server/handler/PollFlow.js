import _ from 'lodash';

import { get, template, keys } from '../texts.js';
import generateShots from '../shots.js';
import Vote from '../models/Vote.js';

class PollStep {
  constructor(handler, room) {
    this.room = room;

    if (room.cache.polls == null || room.cache.polls.length === 0) {
      room.cache.polls = _.shuffle(keys('polls'));
    }

    const key = room.cache.polls.shift();
    const shots = generateShots(2, 6);

    const poll = get('polls', key);
    const explanation = get('generic', 'polls:explanation');

    this.title = poll.title;
    this.users = [...room.playing.users].map((user) => ({ key: user.name, value: user.name }));

    this.vote = new Vote(this.room, () => {
      handler.nextStep({ poll, shots, results: this.vote.results });
    });

    this.data = template({
      ...explanation,
      title: poll.title,
    }, { shots });

    this.sendPollData();
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.sendPollData();
  }

  sendPollData() {
    this.room.playing.sendCard('PollCard', {
      ...this.data,
      options: this.users,
      vote: this.vote.data(),
    });
  }

  removedUser(user) {
    this.vote.removedUser(user);
    this.sendPollData();
  }
}

class ResultStep {
  constructor(handler, room, { poll, shots, results }) {
    const counts = _.countBy([...results], '1');
    const max = _.max(_.values(counts));

    const winner = _.chain(counts)
      .entries()
      .filter((count) => count[1] === max)
      .sample()
      .value()[0];

    const message = template(
      {
        message: _.sample(poll.message),
      },
      {
        shots,
        winner,
      },
    );

    room.playing.sendCard('PollResultCard', {
      ...message,
      results: _.entries(counts),
      title: poll.title,
    });
  }
}

export default [
  PollStep,
  ResultStep,
];
