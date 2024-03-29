import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import { getSelfShots } from '../../helper/Shots.js';

const explanationText = get('generic', 'rockpaperscissor:explanation');
const drawText = get('generic', 'rockpaperscissor:draw');
const winnerText = get('generic', 'rockpaperscissor:winner');
const teamText = get('generic', 'rockpaperscissor:team');
const spectatorText = get('generic', 'rockpaperscissor:spectator');

class ExplanationStep extends StepWithVote {
  constructor(room) {
    super(room);

    const half = Math.ceil(room.playing.size / 2);
    const left = _.sampleSize([...room.playing], half);
    const right = _.without([...room.playing], ...left);

    this.teams = { left, right };

    const parts = room.id.split('-');

    this.global.card = 'ConfirmationCard';
    this.global.data = template(explanationText, {
      leftName: parts[0],
      leftPlayers: left.map((p) => p.name).join('*, *'),
      rightName: parts[2],
      rightPlayers: right.map((p) => p.name).join('*, *'),
    });

    this.playing.data = {
      button: explanationText.data.button,
    };

    this.update();
  }

  nextStep() {
    this.room.handler.next({ left: this.teams.left, right: this.teams.right });
  }

  action(user) {
    this.vote.submit(user);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class GameStep extends StepWithVote {
  constructor(room, { left, right }) {
    super(room);
    this.teams = { left, right };

    const parts = room.id.split('-');

    this.global.card = 'PollCard';

    const options = ['scissor', 'rock', 'paper'].map((key) => ({ key, value: GameStep.keyToName(key) }));
    this.spectating.data = {
      ...template(spectatorText, {
        left: parts[0],
        right: parts[2],
      }),
      options,
      selected: true,
    };
    for (const player of left) {
      this.players[player.id].data = {
        ...template(teamText, {
          team: parts[0],
        }),
        options,
      };
    }
    for (const player of right) {
      this.players[player.id].data = {
        ...template(teamText, {
          team: parts[2],
        }),
        options,
      };
    }

    this.update();
  }

  static keyToName(key) {
    if (key === 'scissor') {
      return '✌ Schere';
    }
    if (key === 'rock') {
      return '✊ Stein';
    }
    return '✋ Papier';
  }

  nextStep() {
    const left = this.teams.left.map((p) => this.vote.results.get(p));
    const right = this.teams.right.map((p) => this.vote.results.get(p));
    const leftDecision = GameStep.findDecision(left);
    const rightDecision = GameStep.findDecision(right);

    if (leftDecision.length !== 1) {
      const options = leftDecision.map((key) => ({ key, value: GameStep.keyToName(key) }));
      for (const player of this.teams.left) {
        this.vote.reset(player);
        this.players[player.id].data = {
          ...this.players[player.id].data,
          options,
          selected: null,
        };
      }
    }

    if (rightDecision.length !== 1) {
      const options = rightDecision.map((key) => ({ key, value: GameStep.keyToName(key) }));
      for (const player of this.teams.right) {
        this.vote.reset(player);
        this.players[player.id].data = {
          ...this.players[player.id].data,
          options,
          selected: null,
        };
      }
    }

    if (leftDecision.length !== 1 || rightDecision.length !== 1) {
      this.update();
    } else {
      this.room.handler.next({
        left: this.teams.left,
        right: this.teams.right,
        decisions: [leftDecision[0], rightDecision[0]],
      });
    }
  }

  static findDecision(votes) {
    const counts = _.countBy([...votes]);
    const max = _(counts).values().max();

    return _(counts)
      .entries()
      .filter((count) => count[1] === max)
      .map('0')
      .value();
  }

  action(user, payload) {
    this.vote.submit(user, payload);

    this.players[user.id].data = {
      ...this.players[user.id].data,
      selected: payload,
    };

    this.update();
  }
}

class ResultStep extends Step {
  constructor(room, { left, right, decisions }) {
    super(room);

    const winner = ResultStep.findWinner(...decisions);

    const winnerSign = decisions[winner === 'left' ? 0 : 1];
    const loserSign = decisions[winner === 'left' ? 1 : 0];

    let content;

    if (winner === 'draw') {
      content = template(drawText, {
        shots: getSelfShots(),
        symbol: GameStep.keyToName(winnerSign),
      });
    } else {
      content = template(winnerText, {
        winner: GameStep.keyToName(winnerSign),
        loser: GameStep.keyToName(loserSign),
        losersName: room.id.split('-')[winner === 'left' ? 2 : 0],
        losers: (winner === 'left' ? right : left).map((p) => p.name).join('*, *'),
        shots: getSelfShots(),
      });
    }

    this.global.card = 'InformationCard';
    this.global.data = {
      ...content,
    };

    this.send();
  }

  static findWinner(left, right) {
    if (left === right) {
      return 'draw';
    }

    if (left === 'paper' && right === 'rock') {
      return 'left';
    }

    if (left === 'rock' && right === 'scissor') {
      return 'left';
    }

    if (left === 'scissor' && right === 'paper') {
      return 'left';
    }

    return 'right';
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultStep,
];
