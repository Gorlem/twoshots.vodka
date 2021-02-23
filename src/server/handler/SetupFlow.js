import { get, template } from '../texts.js';

class RoleSelectionStep {
  constructor(handler, user) {
    this.user = user;
    this.handler = handler;

    const content = get('generic', 'setup:role');

    user.sendCard('PollCard', {
      ...template(content),
      options: content.data.options,
    });
  }

  action(user, role) {
    this.user.role = role;
    this.handler.nextStep(role);
  }
}

class NameSelectionStep {
  constructor(handler, user) {
    this.user = user;
    this.handler = handler;

    const content = get('generic', 'setup:name');

    this.data = {
      ...template(content),
      type: 'string',
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
      this.user.name = name;
      this.handler.nextStep();
    }
  }
}

export default [
  RoleSelectionStep,
  { when: (data) => data === 'player', then: NameSelectionStep },
];
