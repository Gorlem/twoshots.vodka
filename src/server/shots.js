import _ from 'lodash';

export default function shots(min, max) {
  const amount = _.random(min, max);
  return amount + (amount === 1 ? ' Schluck' : ' Schlücke');
}
