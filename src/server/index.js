import fs from 'fs';
import _ from 'lodash';

import Handler from './handler/Handler.js';
import SetupFlow from './handler/SetupFlow.js';

import Game from './models/Game.js';
import User from './models/User.js';

export default function (io) {
  const game = new Game();

  const names = _(fs.readFileSync('src/server/data/names.txt'))
    .split(/\r\n|\n/)
    .filter((row) => row !== '' && !row.startsWith('#'))
    .sort()
    .value();

  io.on('connection', (socket) => {
    socket.user = new User(socket);
    socket.emit('card:name', null);

    socket.on('names', (callback) => {
      callback?.(names);
    });

    socket.on('has-room', (roomId, callback) => {
      const room = game.findRoomById(roomId);
      callback?.(room != null);
    });

    socket.on('create-room', (callback) => {
      socket.room?.leave(socket.user);
      const room = game.createRoom();
      callback?.(room.id);
    });

    socket.on('room:join', (roomId) => {
      const room = game.findRoomById(roomId);

      if (room == null) {
        socket.emit('room:id', null);
        return;
      }

      socket.emit('room:id', room.id);

      socket.handler = new Handler(socket.user, () => {
        socket.handler = room.handler;
        if (socket.user.role === 'player') {
          room.addPlayer(socket.user);
        } else if (socket.user.role === 'spectator') {
          room.addSpectator(socket.user);
        }
      });
      socket.handler.pushFlow(SetupFlow);
      socket.handler.nextStep();
    });

    socket.on('card:action', (...payload) => socket.handler.action(socket.user, ...payload));

    socket.on('disconnect', () => {
      const { room } = socket;

      if (room == null) {
        return;
      }

      if (room.playing.users.length === 0) {
        game.removeRoom(room);
      }
    });
  });
}
