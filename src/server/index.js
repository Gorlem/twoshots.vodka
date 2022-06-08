import logEvent from './analytics.js';

import Game from './models/Game.js';
import User from './models/User.js';

const game = new Game();

export default function (io) {
  io.on('connection', (socket) => {
    logEvent(socket.id, 'user_connected');

    socket.on('parts', (callback) => {
      callback(Game.getNameParts());
    });

    socket.on('room/join', (roomId, role, name, callback) => {
      const user = new User(socket);
      user.role = role;
      user.name = name;

      socket.user = user;

      let room;

      if (roomId === 'new') {
        room = game.createRoom();
        logEvent(socket.id, 'room_created', { room: room.id });
      } else {
        room = game.findRoomById(roomId);
      }

      if (room == null) {
        callback(null);
        return;
      }

      logEvent(socket.id, 'room_joined', { room: room.id });

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
      socket.room?.removeUser(socket.user);
      logEvent(socket.id, 'user_disconnected');

      if (socket.room) {
        logEvent(socket.id, 'room_left', { room: socket.room.id });
      }
    });

    socket.on('force-flow', (flowName) => {
      socket.room?.forceFlow(flowName);
    });
  });
}
