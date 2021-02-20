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

    user.sendCard('InputCard', {
      ...template(content),
      type: 'string',
    });
  }

  action(user, name) {
    this.user.name = name;
    this.handler.nextStep();
  }
}

export default [
  RoleSelectionStep,
  { when: (data) => data === 'player', then: NameSelectionStep },
];
