import _ from 'lodash';

export function getShots(min, max) {
  const amount = _.random(min, max);
  return amount + (amount === 1 ? ' Schluck' : ' Schlücke');
}

export function getDistributedShots() {
  return getShots(2, 6);
}

export function getSelfShots() {
  return getShots(1, 3);
}
