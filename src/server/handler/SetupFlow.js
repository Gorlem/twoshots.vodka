import { get, template } from '../texts.js';

const waitingText = get('generic', 'setup:waiting');

class RoleSelectionStep {
  constructor(handler, user, { room }) {
    this.handler = handler;
    this.room = room;

    const content = get('generic', 'setup:role');

    user.sendCard('PollCard', {
      ...template(content),
      options: content.data.options,
    });
  }

  action(user, role) {
    user.role = role;

    if (role === 'spectator') {
      this.room.addSpectator(user);
    }

    this.handler.nextStep({ role, room: this.room });
  }
}

class NameSelectionStep {
  constructor(handler, user, { room }) {
    this.user = user;
    this.handler = handler;
    this.room = room;

    const content = get('generic', 'setup:name');

    this.data = {
      ...template(content),
      type: 'string',
      button: content.data.button,
    };
    this.sendCard();
  }

  sendCard(extra) {
    this.user.sendCard('InputCard', {
      ...this.data,
      ...extra,
    });
  }

  action(user, name) {
    name = name.trim();
    if (name.length > 10) {
      this.sendCard(template(get('generic', 'setup:name:toolong'), { max: 10 }));
    } else {
      user.name = name;

      if (this.room.isInLobby()) {
        this.room.addPlayer(user);
        this.handler.nextStep();
      } else {
        this.room.addPending(user);
        this.handler.nextStep('waiting');
      }
    }
  }
}

class WaitingStep {
  constructor(handler, user) {
    user.sendCard('InformationCard', waitingText);
  }
}

export default [
  RoleSelectionStep,
  { when: (data) => data.role === 'player', then: NameSelectionStep },
  { when: (data) => data === 'waiting', then: WaitingStep },
];
