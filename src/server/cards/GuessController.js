import _ from 'lodash/fp.js';
import fs from 'fs';

import Controller from './Controller.js';
import Vote from '../models/Vote.js';

import { prepare, template } from '../template.js';
import generateShots from '../shots.js';

const guesses = JSON.parse(fs.readFileSync('src/server/data/guesses.json'));
const texts = JSON.parse(fs.readFileSync('src/server/data/texts.json'));

const guessMessage = prepare(texts['GuessController:message']);
const resultMessage = prepare(texts['GuessController:result']);
const sourceMessage = prepare(texts['GuessController:source']);

class GuessStep {
  constructor({
    room, guess, shots, title,
  }) {
    this.room = room;
    this.guess = guess;
    this.title = title;

    this.vote = new Vote(this.room, () => {
      room.controller.setExplanationStep(this.vote.results);
    });

    this.message = template(guessMessage, { shots });

    this.sendQuestionData();
  }

  action(user, payload) {
    this.vote.submit(user, payload);
    this.sendQuestionData();
  }

  sendQuestionData() {
    this.room.playing.sendCard('InputCard', {
      title: this.title,
      message: this.message,
      hint: this.guess.unit,
      vote: this.vote.data(),
    });
  }

  removedUser(user) {
    this.vote.removedUser(user);
    this.sendQuestionData();
  }
}

class ResultStep {
  constructor({
    room, guess, shots, title,
  }, results) {
    const getDifference = (entry) => Math.abs(guess.answer - Number.parseFloat(entry[1].replace(',', '.')));

    const getWinner = _.minBy(getDifference);
    const getLoser = _.flow([
      _.reverse,
      _.maxBy(getDifference),
    ]);

    const voted = [...results.entries()];

    const winner = getWinner(voted)[0].name;
    const loser = getLoser(voted)[0].name;

    const answer = guess.answer.toLocaleString('de-DE', { useGrouping: false }) + (guess.unit == null ? '' : ` ${guess.unit}`);

    const message = template(resultMessage, {
      shots, winner, loser, answer,
    });
    const footer = template(sourceMessage, {
      url: guess.source,
    });

    room.playing.sendCard('InformationCard', {
      message,
      title,
      footer,
    });
  }
}

export default class GuessController extends Controller {
  constructor(room) {
    super(room);

    this.shots = generateShots(1, 5);

    this.guess = _.sample(guesses);
    this.title = prepare(this.guess.question);

    this.setGuessStep();
  }

  setGuessStep() {
    this.setStep(new GuessStep(this));
  }

  setExplanationStep(results) {
    this.setStep(new ResultStep(this, results));
  }
}
