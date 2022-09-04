import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import { getDistributedShots, getSelfShots } from '../../helper/Shots.js';

import Cache from '../../models/Cache.js';

const explanationText = get('generic', 'prompts:explanation');
const gameText = get('generic', 'prompts:game');
const resultsSingleSingleText = get('generic', 'prompts:results/single/single');
const resultsMultipleSingleText = get('generic', 'prompts:results/multiple/single');
const resultsSingleMultipleText = get('generic', 'prompts:results/single/multiple');
const resultsMultipleMultipleText = get('generic', 'prompts:results/multiple/multiple');

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    if (room.cache.prompts == null) {
      room.cache.prompts = new Cache(keys('prompts'));
    }

    this.global.card = 'ConfirmationCard';
    this.spectating.card = 'InformationCard';
    this.global.data = {
      ...template(explanationText),
      ...explanationText.data,
    };

    this.update();
  }

  nextStep() {
    const scores = new Map();

    for (const player of this.room.playing) {
      scores.set(player, 0);
    }

    this.room.handler.next({ scores });
  }

  action(user, payload) {
    this.vote.submit(user, payload);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class InputStep extends StepWithVote {
  constructor(room, { scores }) {
    super(room);
    this.scores = scores;

    this.prompt = get('prompts', room.cache.prompts.get());

    this.spectating.card = 'InformationCard';
    this.spectating.data = {
      title: this.prompt.question,
    };

    this.playing.card = 'InputCard';
    this.playing.data = {
      ...template(gameText),
      title: this.prompt.question,
      ...gameText.data,
    };

    this.update();
  }

  nextStep() {
    for (const [user, cleaned] of this.vote.results) {
      const entry = this.prompt.answers.find((answer) => answer.texts.includes(cleaned));
      if (entry) {
        this.scores.set(user, this.scores.get(user) + entry.percent);
      }
    }

    this.playing.card = 'InformationCard';
    this.send();

    this.room.handler.next({ scores: this.scores });
  }

  action(user, payload) {
    const cleaned = payload.toLowerCase().replace(/[^a-zäöüß]/g, ' ').trim();
    this.vote.submit(user, cleaned);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class ResultStep extends Step {
  constructor(room, { scores }) {
    super(room);

    const results = [...scores];

    const max = _.maxBy(results, '1')[1];
    const min = _.minBy(results, '1')[1];

    const winner = results
      .filter((result) => result[1] === max)
      .map((result) => result[0].name);

    const loser = results
      .filter((result) => result[1] === min)
      .map((result) => result[0].name);

    let text = resultsSingleSingleText;

    if (winner.length > 1 && loser.length > 1) {
      text = resultsMultipleMultipleText;
    } else if (winner.length > 1) {
      text = resultsMultipleSingleText;
    } else if (loser.length > 1) {
      text = resultsSingleMultipleText;
    }

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(text, {
        selfShots: getSelfShots(),
        distributedShots: getDistributedShots(),
        winner: winner.join('*, *'),
        winnerCorrect: max,
        loser: loser.join('*, *'),
        loserCorrect: min,
      }),
      options: results.map(([user, score]) => ({
        key: user.id,
        value: user.name,
        result: `${score} Punkte`,
      })),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  InputStep,
  InputStep,
  InputStep,
  ResultStep,
];
