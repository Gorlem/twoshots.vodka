import { InfluxDB, Point } from '@influxdata/influxdb-client';

import { INFLUXDB_TOKEN, ENVIRONMENT } from './env.js';

const url = 'https://analytics.twoshots.vodka';
const organisation = 'twoshots.vodka';
const bucket = 'analytics';

const influxDB = ENVIRONMENT === 'prod' ? new InfluxDB({ url, token: INFLUXDB_TOKEN }) : null;
const writeApi = ENVIRONMENT === 'prod' ? influxDB.getWriteApi(organisation, bucket, 'ms') : null;

export default function logEvent(userId, event, data) {
  if (ENVIRONMENT !== 'prod') {
    return;
  }

  let point = new Point('events')
    .tag('event', event)
    .stringField('user_id', userId)
    .timestamp(Date.now());

  if (data) {
    for (const [key, value] of Object.entries(data)) {
      point = point.stringField(key, value.toString());
    }
  }

  writeApi.writePoint(point);
}
