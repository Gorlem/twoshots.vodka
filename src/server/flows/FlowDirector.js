import { readdirSync } from 'fs';

import Cache from '../models/Cache.js';

const allFlows = {};
const categories = {};

const basePath = 'src/server/flows/';

function getFlows(type) {
  const promises = readdirSync(basePath + type)
    .map((file) => {
      const name = file.slice(0, -3);
      return import(`./${type}/${file}`)
        .then((flow) => {
          allFlows[name] = flow.default;
          return flow.default;
        });
    });

  Promise.all(promises).then((flows) => {
    categories[type] = flows;
  });
}

getFlows('basic');
getFlows('votes');
getFlows('knowledge');
getFlows('games');

export default class FlowDirector {
  categoryCaches = [];

  constructor() {
    for (const entry of Object.entries(categories)) {
      this.categoryCaches.push(new Cache(entry[1]));
    }

    this.cache = new Cache(() => this.categoryCaches.map((cache) => cache.get()));
  }

  getNextFlow() {
    return this.cache.get();
  }

  getFlowByName(flowName) {
    return allFlows[flowName];
  }
}
