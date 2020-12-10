import { createServer } from 'http';
import { Server } from 'socket.io';

import createGame from './index.js';

const server = createServer();
const io = new Server(server);

createGame(io);

server.listen(3000);
