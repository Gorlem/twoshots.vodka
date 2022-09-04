import _ from 'lodash';

import Step from '../../steps/Step.js';
import StepWithVote from '../../steps/StepWithVote.js';

import { get, template } from '../../texts.js';
import { getSelfShots } from '../../helper/Shots.js';
import CountdownStep from '../../steps/CountdownStep.js';

const explanationText = get('generic', 'taskhero:explanation');
const countdownText = get('generic', 'taskhero:countdown');
const pointsText = get('generic', 'taskhero:points');
const resultsText = get('generic', 'taskhero:results');

const collectionTaskText = get('generic', 'taskhero:collectiontask');
const invertedCollectionTaskText = get('generic', 'taskhero:invertedcollectiontask');
const additionTaskText = get('generic', 'taskhero:additiontask');
const subtractionTaskText = get('generic', 'taskhero:subtractiontask');
const multiplicationTaskText = get('generic', 'taskhero:multiplicationtask');
const biggerTaskText = get('generic', 'taskhero:biggertask');
const smallerTaskText = get('generic', 'taskhero:smallertask');
const buttonTaskText = get('generic', 'taskhero:buttontask');

const collections = get('tasks', 'collections');

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
  seconds = 60;
  tasks = [
    this.collectionTask.bind(this),
    this.invertedCollectionTask.bind(this),
    this.additionTask.bind(this),
    this.subtractionTask.bind(this),
    this.multiplicationTask.bind(this),
    this.biggerTask.bind(this),
    this.smallerTask.bind(this),
    this.buttonTask.bind(this),
  ];

  constructor(room, { left, right }) {
    super(room);

    this.parts = room.id.split('-');

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(countdownText, { seconds: 60 }),
    };

    this.left = this.setupTeam(left);
    this.right = this.setupTeam(right);

    this.spectating.card = 'ResultsCard';
    this.updateSpectatorView();

    this.send();

    this.interval = setInterval(this.countdown.bind(this), 1000);
  }

  updateSpectatorView() {
    this.spectating.data = {
      options: [
        {
          key: 'left',
          value: `Team ${this.parts[0]}`,
          result: `${this.left.count} gelöste Aufgaben`,
        },
        {
          key: 'right',
          value: `Team ${this.parts[2]}`,
          result: `${this.right.count} gelöste Aufgaben`,
        },
      ],
    };
  }

  setupTeam(players) {
    const team = {
      players,
      current: _.sample(players),
      count: 0,
    };

    for (const member of team.players) {
      this.players[member.id].card = 'InformationCard';
      this.players[member.id].data = {
        ...template(pointsText, {
          points: team.count,
          current: team.current.name,
        }),
      };
    }

    team.answer = this.task(team.current);

    return team;
  }

  countdown() {
    this.seconds -= 1;

    this.global.data = {
      ...template(countdownText, { seconds: this.seconds }),
    };
    this.send();

    if (this.seconds === 0) {
      this.nextStep();
    }
  }

  nextStep() {
    this.stop();
    this.room.handler.next({ left: this.left, right: this.right });
  }

  stop() {
    clearInterval(this.interval);
  }

  task(player) {
    return _.sample(this.tasks)(player);
  }

  collectionTask(player) {
    const collection = _.sample(collections);
    const options = _.sampleSize(collection, _.random(3, 5));
    const answer = _.sample(options);

    this.players[player.id].card = 'PollCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(collectionTaskText, {
        label: answer.label,
      }),
      options: options.map((option, index) => ({ key: index, value: option.value, size: 4 })),
    };

    const index = options.indexOf(answer);

    return (value) => value === index;
  }

  invertedCollectionTask(player) {
    const collection = _.sample(collections);
    const options = _.sampleSize(collection, _.random(3, 5));
    const answer = _.sample(options);

    this.players[player.id].card = 'PollCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(invertedCollectionTaskText, {
        label: answer.label,
      }),
      options: options.map((option, index) => ({ key: index, value: option.value, size: 4 })),
    };

    const index = options.indexOf(answer);

    return (value) => value !== index;
  }

  additionTask(player) {
    const left = _.random(9);
    const right = _.random(9);
    const answer = (left + right).toString();

    this.players[player.id].card = 'InputCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(additionTaskText, { left, right }),
      ...additionTaskText.data,
    };

    return (value) => value === answer;
  }

  subtractionTask(player) {
    const left = _.random(8, 20);
    const right = _.random(8);
    const answer = (left - right).toString();

    this.players[player.id].card = 'InputCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(subtractionTaskText, { left, right }),
      ...subtractionTaskText.data,
    };

    return (value) => value === answer;
  }

  multiplicationTask(player) {
    const left = _.random(5);
    const right = _.random(5);
    const answer = (left * right).toString();

    this.players[player.id].card = 'InputCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(multiplicationTaskText, { left, right }),
      ...multiplicationTaskText.data,
    };

    return (value) => value === answer;
  }

  biggerTask(player) {
    const numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
      .map((value, key) => ({ key, value, size: 4 }));

    const options = _.sampleSize(numbers, _.random(3, 5));
    const max = _.maxBy(options, 'key');
    const divider = _.random(0, max.key - 1);

    this.players[player.id].card = 'PollCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(biggerTaskText, {
        number: divider,
      }),
      options,
    };

    return (value) => value > divider;
  }

  smallerTask(player) {
    const numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
      .map((value, key) => ({ key, value, size: 4 }));

    const options = _.sampleSize(numbers, _.random(3, 5));
    const min = _.minBy(options, 'key');
    const divider = _.random(min.key + 1, 10);

    this.players[player.id].card = 'PollCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(smallerTaskText, {
        number: divider,
      }),
      options,
    };

    return (value) => value < divider;
  }

  buttonTask(player) {
    this.players[player.id].card = 'ConfirmationCard';
    this.players[player.id].data = {
      ...this.players[player.id].data,
      ...template(buttonTaskText),
      ...buttonTaskText.data,
    };

    return () => true;
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
      if (team.answer(value)) {
        team.count += 1;
      }

      team.current = this.nextPlayer(team.players, team.current);

      for (const member of team.players) {
        this.players[member.id].card = 'InformationCard';
        this.players[member.id].data = {
          ...template(pointsText, {
            points: team.count,
            current: team.current.name,
          }),
        };
      }

      this.send();

      team.answer = this.task(team.current);
    }
  }

  action(player, value) {
    this.checkTeam(this.right, player, value);
    this.checkTeam(this.left, player, value);

    this.updateSpectatorView();

    this.send();
  }
}

class ResultsStep extends Step {
  constructor(room, { left, right }) {
    super(room);

    const parts = room.id.split('-');

    const winner = left.count > right.count ? 'left' : 'right';

    this.global.card = 'ResultsCard';
    this.global.data = {
      ...template(resultsText, {
        winnersName: parts[winner === 'left' ? 0 : 2],
        losersName: parts[winner === 'left' ? 2 : 0],
        losers: (winner === 'left' ? right.players : left.players).map((p) => p.name).join('*, *'),
        shots: getSelfShots(),
      }),
      options: [
        {
          key: 'left',
          value: `Team ${parts[0]}`,
          result: `${left.count} gelöste Aufgaben`,
        },
        {
          key: 'right',
          value: `Team ${parts[2]}`,
          result: `${right.count} gelöste Aufgaben`,
        },
      ],
    };

    this.send();
  }
}

export default [
  ExplanationStep,
  CountdownStep,
  GameStep,
  ResultsStep,
];
