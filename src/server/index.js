import { createServer } from 'http';
import use from './server.js';

const server = createServer();
use(server);
server.listen(3000);
