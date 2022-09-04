import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template, keys } from '../../texts.js';
import { getSelfShots } from '../../helper/Shots.js';
import Cache from '../../models/Cache.js';

const explanationText = get('generic', 'hangman:explanation');
const gameText = get('generic', 'hangman:game');
const resultsWordText = get('generic', 'hangman:results/word');
const resultsStepsText = get('generic', 'hangman:results/steps');

const hangmanSteps = keys('hangmansteps').length;

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

class GameStep extends Step {
  constructor(room, { left, right }) {
    super(room);

    if (room.cache.hangman == null) {
      room.cache.hangman = new Cache(keys('hangmanwords'));
    }

    this.word = get('hangmanwords', room.cache.hangman.get());

    this.left = this.setupTeam(left);
    this.right = this.setupTeam(right);

    this.send();
  }

  setupTeam(players) {
    const team = {
      players,
      current: _.sample(players),
      guesses: new Set(),
      step: 0,
    };

    this.hangman(team);

    return team;
  }

  nextStep(team, status) {
    const side = team === this.left ? 'left' : 'right';
    this.room.handler.next({
      word: this.word,
      side,
      left: this.left,
      right: this.right,
      status,
    });
  }

  nextPlayer(team, current) {
    const index = team.indexOf(current) + 1;

    if (index >= team.length) {
      return team[0];
    }

    return team[index];
  }

  checkTeam(team, player, value) {
    if (team.current === player) {
      const guess = value.toLowerCase().trim();

      team.guesses.add(guess);

      if (guess.length === 1) {
        if (this.word.includes(guess)) {
          const done = this.word
            .split('')
            .every((char) => team.guesses.has(char));
          if (done) {
            this.nextStep(team, 'word');
            return;
          }
        } else {
          team.step += 1;
        }
      } else if (guess.length > 1) {
        if (this.word === guess) {
          this.nextStep(team, 'word');
          return;
        }

        team.step += 1;
      }

      if (team.step >= hangmanSteps) {
        this.nextStep(team, 'steps');
        return;
      }

      team.current = this.nextPlayer(team.players, team.current);

      this.hangman(team);
    }
  }

  hangman(team) {
    const hidden = this.word
      .split('')
      .map((char) => (team.guesses.has(char) ? char : '_'))
      .join('');

    const step = get('hangmansteps', team.step);

    const hangman = step
      .map((part) => `    ${part}`)
      .join('\n');

    for (const member of team.players) {
      this.players[member.id].card = 'InformationCard';
      this.players[member.id].data = {
        ...template(gameText, {
          amount: this.word.length,
          guesses: [...team.guesses].join(', '),
          hangman,
          current: team.current.name,
        }),
        title: hidden,
        ...gameText.data,
      };
    }

    this.send();

    this.players[team.current.id].card = 'InputCard';

    this.send();
  }

  action(user, payload) {
    this.checkTeam(this.right, user, payload);
    this.checkTeam(this.left, user, payload);
  }
}

class ResultStep extends Step {
  constructor(room, {
    word,
    side,
    left,
    right,
    status,
  }) {
    super(room);

    this.global.card = 'InformationCard';

    const parts = room.id.split('-');

    const shots = getSelfShots();

    if (status === 'word') {
      this.global.data = {
        ...template(resultsWordText, {
          winnerTeam: side === 'left' ? parts[0] : parts[2],
          loserTeam: side === 'left' ? parts[2] : parts[0],
          losers: (side === 'left' ? right : left).players
            .map((player) => player.name)
            .join('*, *'),
          word,
          shots,
        }),
      };
    } else {
      this.global.data = {
        ...template(resultsStepsText, {
          winnerTeam: side === 'left' ? parts[2] : parts[0],
          loserTeam: side === 'left' ? parts[0] : parts[2],
          losers: (side === 'left' ? left : right).players
            .map((player) => player.name)
            .join('*, *'),
          word,
          shots,
        }),
      };
    }

    this.send();
  }
}

export default [
  ExplanationStep,
  GameStep,
  ResultStep,
];
