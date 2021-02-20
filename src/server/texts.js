import fs from 'fs';
import _ from 'lodash';
import marked from 'marked';

const sources = new Map();

function parseSourceFile(source) {
  const file = fs.readFileSync(`src/server/data/${source}.json`);
  const content = JSON.parse(file);
  return content;
}

export function get(source, path) {
  if (!sources.has(source)) {
    sources.set(source, parseSourceFile(source));
  }

  const content = sources.get(source)[path];
  return content;
}

export function template(content, data) {
  const result = {};

  for (const type of ['title', 'message', 'footer']) {
    if (content[type] != null) {
      const templated = _.template(content[type])(data);
      const html = marked(templated);
      result[type] = html;
    }
  }

  return result;
}
