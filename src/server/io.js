import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer();
const io = new Server(server);
server.listen(3000);

export default io;
