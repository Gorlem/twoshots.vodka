import winston from 'winston';

import Game from './models/Game.js';
import User from './models/User.js';

const game = new Game();

export default function (io) {
  io.on('connection', (socket) => {
    socket.on('room/join', (roomId, role, name, callback) => {
      const user = new User(socket);
      socket.user = user;
      user.role = role;
      user.name = name;

      user.logger = winston.child({ user: user.id });

      let room;

      if (roomId === 'new') {
        room = game.createRoom();
      } else {
        room = game.findRoomById(roomId);
      }

      if (room == null) {
        callback(null);
        return;
      }

      callback(room.id);
      socket.room = room;

      if (role === 'spectator') {
        room.addSpectator(user);
      } else if (room.isInLobby()) {
        room.addPlayer(user);
      } else {
        room.addPending(user);
      }
    });

    socket.on('room/action', (...payload) => {
      socket.room?.handler?.action(socket.user, ...payload);
    });

    socket.on('room/vote', () => {
      socket.room?.action(socket.user);
    });

    socket.on('disconnect', () => {
      socket.user.logger.info('User disconnected');
      socket.room?.remove(socket.user);
    });

    socket.on('force-flow', (flowName) => {
      socket.user.logger.info(`User forced ${flowName}`);
      socket.room?.forceFlow(flowName);
    });
  });
}
