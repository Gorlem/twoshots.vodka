import { get, template } from '../texts.js';

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
    this.handler.nextStep({ role, room: this.room });
  }
}

class NameSelectionStep {
  constructor(handler, user, { room, role }) {
    this.user = user;
    this.handler = handler;
    this.room = room;
    this.role = role;

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
      this.handler.nextStep({ role: this.role, name, room: this.room });
    }
  }
}

export default [
  RoleSelectionStep,
  { when: (data) => data.role === 'player', then: NameSelectionStep },
];
