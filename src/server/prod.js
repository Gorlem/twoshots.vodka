import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { resolve } from 'path';

import createGame from './index.js';

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
