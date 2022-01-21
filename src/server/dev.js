import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';

import createGame from './index.js';

winston.configure({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({
      timestamp, level, message, ...rest
    }) => `${timestamp} ${level}: ${message} ${JSON.stringify(rest)}`),
  ),
});
winston.add(new winston.transports.Console());

const server = createServer();
const io = new Server(server);

createGame(io);

server.listen(3000);
