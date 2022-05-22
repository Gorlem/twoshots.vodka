import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import Cards from '../../models/Cards.js';

import { get, template } from '../../texts.js';

const instructionText = get('generic', 'kingscup:instruction');
const turnText = get('generic', 'kingscup:turn');
const explanationText = get('generic', 'kingscup:explanation');
const resultsText = get('generic', 'kingscup:results');

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanationText);

    this.playing.data = {
      button: explanationText.data.button,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next();
  }

  action(user) {
    this.vote.submit(user);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class KingscupStep extends Step {
  playerCards = new Map();

  constructor(room) {
    super(room);

    this.cards = Cards.sample(Math.ceil(room.playing.size * 1.5))
      .map((card) => ({ hidden: true, value: card }));

    this.player = _.sample(room.seating);

    this.showCards();
  }

  showCards() {
    this.global.card = 'CarouselCard';
    this.global.data = {
      ...template(turnText, {
        player: this.player.name,
      }),
      options: this.cards.map((card, index) => ({ key: index, value: card.hidden ? '❓' : card.value, static: !card.hidden })),
      selected: true,
    };

    this.players[this.player.id].data = {
      selected: null,
    };

    this.send();
  }

  showInstruction(card) {
    this.playerCards.set(this.player, card);

    const rank = Cards.getRank(card);

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(instructionText, {
        player: this.player.name,
        card,
      }),
      ...template(get('kingscup', rank)),
    };

    this.players[this.player.id].card = 'ConfirmationCard';
    this.players[this.player.id].data = {
      ...instructionText.data,
    };

    this.send();
  }

  action(user, value) {
    if (user !== this.player) {
      return;
    }

    if (value == null) {
      this.players[user.id].card = undefined;
      this.players[user.id].data = undefined;
      this.nextPlayer();

      if (this.playerCards.has(this.player)) {
        this.room.handler.next({ cards: this.playerCards });
      } else {
        this.showCards();
      }
    } else {
      this.cards[value].hidden = false;
      this.showInstruction(this.cards[value].value);
    }
  }

  nextPlayer() {
    let index = this.room.seating.indexOf(this.player) + 1;
    if (index >= this.room.seating.length) {
      index = 0;
    }

    this.player = this.room.seating[index];
  }
}

class ResultsStep extends Step {
  constructor(room, { cards }) {
    super(room);

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText),
      options: [...cards].map((entry) => ({ key: entry[0].id, value: entry[0].name, result: entry[1] })),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  KingscupStep,
  ResultsStep,
];
