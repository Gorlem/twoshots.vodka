import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import generateShots from '../../shots.js';
import Cache from '../../models/Cache.js';

const explanationText = get('generic', 'quiz:explanation');
const resultsText = get('generic', 'quiz:results');

class QuizStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.quiz == null) {
      room.cache.quiz = new Cache(keys('quiz'));
    }

    const key = room.cache.quiz.get();
    this.entry = get('quiz', key);

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(explanationText),
      title: this.entry.question,
    };

    this.playing.card = 'PollCard';
    this.playing.data = {
      options: _.shuffle(this.entry.answers).map((answer) => ({
        key: answer,
        value: answer,
      })),
    };

    this.spectating.data = {
      selected: true,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next({ entry: this.entry, results: [...this.vote.results] });
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
  constructor(room, { entry, results }) {
    super(room);

    const correct = entry.answers[0];

    const losers = results
      .filter((result) => result[1] !== correct)
      .map(([user]) => user.name)
      .join('*, *');

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        shots: generateShots(2, 5),
        correct,
        losers,
        explanation: entry.explanation,
        url: entry.source,
        domain: new URL(entry.source).hostname,
      }),
      options: results.map((e) => ({
        key: e[0].id,
        value: e[0].name,
        result: e[1],
      })),
    };

    this.send();
  }
}

export default [
  QuizStep,
  ResultStep,
];
