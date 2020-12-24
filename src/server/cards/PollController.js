import _ from 'lodash';
import fs from 'fs';

import Controller from './Controller.js';

import { prepare, template } from '../template.js';
import generateShots from '../shots.js';
import Vote from '../models/Vote.js';

const polls = JSON.parse(fs.readFileSync('src/server/data/polls.json'));

for (const poll of polls) {
  poll.title = prepare(poll.title);
  poll.message = poll.message.map((message) => prepare(message));
}

class PollStep {
  constructor({ room, poll }) {
    this.room = room;
    this.poll = poll;

    this.vote = new Vote(this.room, () => {
      room.controller.setResultStep(this.vote.results);
    });

    this.title = poll.title;
    this.users = [...room.playing.users].map((user) => user.name);

    this.sendPollData();
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.sendPollData();
  }

  sendPollData() {
    this.room.playing.sendCard('PollCard', {
      title: this.title,
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
  constructor({ room, poll }, results) {
    const counts = _.countBy([...results], '1');
    const max = _.max(_.values(counts));

    const winner = _.chain(counts)
      .entries()
      .filter((count) => count[1] === max)
      .sample()
      .value()[0];

    const message = template(_.sample(poll.message), {
      shots: generateShots(2, 6),
      winner,
    });

    room.playing.sendCard('PollResultCard', {
      message,
      results: _.entries(counts),
      title: poll.title,
    });
  }
}

export default class PollController extends Controller {
  constructor(room) {
    super(room);

    this.shots = generateShots(1, 5);

    this.poll = _.sample(polls);
    this.setPollStep();
  }

  setPollStep() {
    this.setStep(new PollStep(this));
  }

  setResultStep(results) {
    this.setStep(new ResultStep(this, results));
  }
}
