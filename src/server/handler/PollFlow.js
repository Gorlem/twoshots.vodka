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
    this.shots = generateShots(2, 6);

    const poll = get('polls', key);
    const explanation = get('generic', 'polls:explanation');
    const voted = get('generic', 'voted');

    this.title = poll.title;
    this.users = [...room.playing.users].map((user) => ({ key: user.name, value: user.name }));

    this.vote = new Vote(this.room, () => {
      handler.nextStep({ poll, shots: this.shots, results: this.vote.results });
    });

    this.content = {
      title: poll.title,
      ...explanation,
      ...voted,
    };

    this.room.playing.sendCard('PollCard', {
      ...template(this.content, { shots: this.shots, ...this.vote.data() }),
      options: this.users,
    });
    this.room.spectating.sendCard('PollCard', {
      ...template(this.content, { shots: this.shots, ...this.vote.data() }),
      options: this.users,
      selected: true,
    });
  }

  action(user, payload) {
    this.vote.submit(user, payload);

    for (const player of this.room.playing.users) {
      if (this.vote.results.has(player)) {
        player.sendCard('PollCard', {
          ...template(this.content, { shots: this.shots, ...this.vote.data() }),
          options: this.users,
          selected: this.vote.results.get(player),
        });
      } else {
        player.sendCard('PollCard', {
          ...template(this.content, { shots: this.shots, ...this.vote.data() }),
          options: this.users,
        });
      }
    }

    this.room.spectating.sendCard('PollResultCard', {
      title: this.content.title,
      results: _([...this.vote.results])
        .countBy('1')
        .values()
        .value()
        .map((value) => ['', value]),
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

    const content = {
      message: _.sample(poll.message),
      title: poll.title,
    };

    const message = template(content, { shots, winner });

    room.playing.sendCard('PollResultCard', {
      ...message,
      results: _.entries(counts),
    });
    room.spectating.sendCard('PollResultCard', {
      ...message,
      results: _.entries(counts),
    });
  }
}

export default [
  PollStep,
  ResultStep,
];
