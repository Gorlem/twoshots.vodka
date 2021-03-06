import { get, template } from '../texts.js';

class WaitingStep {
  constructor(handler, user) {
    const waitingText = get('generic', 'pending:waiting');
    user.sendCard('InformationCard', template(waitingText));
  }
}

class VotingStep {
  constructor(handler, user) {
    const votingText = get('generic', 'pending:voting');
    user.sendCard('InformationCard', template(votingText));
  }
}

export default [
  WaitingStep,
  VotingStep,
];
