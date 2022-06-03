import _ from 'lodash';

export default class Cache {
  dataSource = () => [];
  cache = [];

  constructor(dataSource) {
    if (_.isArrayLike(dataSource)) {
      this.dataSource = () => [...dataSource];
    }

    if (_.isFunction(dataSource)) {
      this.dataSource = dataSource;
    }
  }

  get() {
    if (this.cache.length === 0) {
      this.populate();
    }

    return this.cache.shift();
  }

  populate() {
    this.cache = _.shuffle(this.dataSource());
  }
}
