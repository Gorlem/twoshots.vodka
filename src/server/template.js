import _ from 'lodash';

export function prepare(parts) {
  if (!Array.isArray(parts)) {
    return prepare([parts]);
  }

  return parts.map((part) => (part.type == null ? { type: 'text', content: part } : part));
}

export function template(parts, data) {
  const templated = [];
  for (const part of parts) {
    templated.push({
      type: part.type,
      content: _.template(part.content)(data),
    });
  }
  return templated;
}
