import Step from '../Step.js';
import StepWithVote from '../StepWithVote.js';

import { get, template } from '../../texts.js';
import generateShots from '../../shots.js';
import CountdownStep from '../CountdownStep.js';

const explanationText = get('generic', 'defendcastle:explanation');
const teamText = get('generic', 'defendcastle:team');
const spectatorText = get('generic', 'defendcastle:spectator');
const winnerText = get('generic', 'defendcastle:winner');

class ExplanationStep extends StepWithVote {
  constructor(handler, room, { left, right }) {
    super(room);
    this.handler = handler;
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
    this.handler.nextStep({ left: this.teams.left, right: this.teams.right });
  }

  action(user) {
    this.vote.submit(user);

    this.players[user.id].data = {
      selected: true,
    };

    this.update();
  }
}

class GameStep extends Step {
  constructor(handler, room, { left, right }) {
    super(room);
    this.handler = handler;
    this.teams = { left, right };

    this.score = 0;
    this.prevScore = 0;

    const parts = room.id.split('-');

    this.global.card = 'DefendCastleGame';
    this.global.data = {
      score: this.score,
      left: parts[0],
      right: parts[2],
    };

    this.spectating.data = {
      ...template(spectatorText, {
        left: parts[0],
        right: parts[2],
      }),
    };

    for (const player of left) {
      this.players[player.id].data = {
        ...template(teamText, { team: parts[0] }),
      };
    }
    for (const player of right) {
      this.players[player.id].data = {
        ...template(teamText, { team: parts[2] }),
      };
    }

    this.send();

    this.interval = setInterval(this.updateScore.bind(this), 100);
    this.timeout = setTimeout(this.finish.bind(this), 30000);
  }

  finish() {
    this.handler.nextStep({ score: this.score, left: this.teams.left, right: this.teams.right });
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }

  updateScore() {
    if (this.score === this.prevScore) {
      return;
    }

    this.global.data = {
      ...this.global.data,
      score: this.score,
    };
    this.send();

    this.prevScore = this.score;

    if (this.score <= -100 || this.score >= 100) {
      this.finish();
    }
  }

  action(user) {
    if (this.teams.left.includes(user)) {
      this.score += 5 / this.teams.left.length;
    } else if (this.teams.right.includes(user)) {
      this.score -= 5 / this.teams.right.length;
    }
  }
}

class ResultStep extends Step {
  constructor(handler, room, { score, left, right }) {
    super(room);

    const parts = room.id.split('-');

    const winner = score > 0 ? 'right' : 'left';

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(winnerText, {
        winner: parts[winner === 'left' ? 2 : 0],
        losersName: parts[winner === 'left' ? 0 : 2],
        losers: (winner === 'left' ? left : right).map((p) => p.name).join('*, *'),
        shots: generateShots(2, 5),
      }),
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  CountdownStep,
  GameStep,
  ResultStep,
];
