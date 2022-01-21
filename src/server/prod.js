import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { resolve } from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

import createGame from './index.js';

winston.configure({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({
      timestamp, level, message, ...rest
    }) => `${timestamp} ${level}: ${message} ${JSON.stringify(rest)}`),
  ),
});
winston.add(new winston.transports.Console());
winston.add(new winston.transports.DailyRotateFile({
  filename: '%DATE%.log',
  dirname: './logs',
  maxFiles: 30,
}));

const app = express();
app.disable('x-powered-by');

app.use(express.static('dist'));

app.get('/*', (req, res) => {
  res.sendFile(resolve('dist/index.html'));
});

const server = createServer(app);
const io = new Server(server);

createGame(io);

server.listen(4000);
