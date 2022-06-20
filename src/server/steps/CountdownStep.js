import Step from './Step.js';

import { get, template } from '../texts.js';

const countdownText = get('generic', 'countdown');

class CountdownStep extends Step {
  constructor(room, data) {
    super(room);
    this.data = data;

    this.countdown = 3;

    this.global.card = 'InformationCard';
    this.global.data = {
      ...template(countdownText, {
        number: this.countdown,
      }),
    };
    this.send();

    this.interval = setInterval(this.nextNumber.bind(this), 1000);
  }

  nextNumber() {
    this.countdown -= 1;

    if (this.countdown === 0) {
      this.room.handler.next(this.data);
      clearInterval(this.interval);
      return;
    }

    this.global.data = {
      ...template(countdownText, {
        number: this.countdown,
      }),
    };
    this.send();
  }

  stop() {
    clearInterval(this.interval);
  }
}

export default CountdownStep;
