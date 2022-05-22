import winston from 'winston';

import Game from './models/Game.js';
import User from './models/User.js';

const game = new Game();

export default function (io) {
  io.on('connection', (socket) => {
    winston.info('User connected', { user: socket.id });

    socket.on('parts', (callback) => {
      callback(Game.getNameParts());
    });

    socket.on('room/join', (roomId, role, name, callback) => {
      const user = new User(socket);
      user.role = role;
      user.name = name;
      user.logger = winston.child({ user: user.id });

      socket.user = user;

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

      room.addUser(user);
    });

    socket.on('room/action', (...payload) => {
      socket.room?.action(socket.user, ...payload);
    });

    socket.on('room/vote', () => {
      socket.room?.roomVote(socket.user);
    });

    socket.on('disconnect', () => {
      socket.user?.logger?.info('User disconnected');
      socket.room?.removeUser(socket.user);
    });

    socket.on('force-flow', (flowName) => {
      socket.user?.logger?.info(`User forced ${flowName}`);
      socket.room?.forceFlow(flowName);
    });
  });
}
