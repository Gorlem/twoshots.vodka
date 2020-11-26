import { Server } from 'socket.io';

import Game from './game/game.js';
import User from './models/User.js';
import Vote from './models/Vote.js';

export default function use(server) {
  const io = new Server(server);
  const game = new Game();

  io.on('connection', (socket) => {
    socket.user = new User();
    socket.user.id = socket.id;

    console.log(`${socket.user} connected`);

    socket.on('has-room', (roomId, callback) => {
      const room = game.findRoomById(roomId);
      callback(room != null);
    });

    socket.on('create-room', (callback) => {
      const room = game.createRoom();
      callback(room.id);
      console.log(`${socket.user} created ${room}`);
    });

    socket.on('join-room', (roomId, name) => {
      const room = game.findRoomById(roomId);

      if (room == null) {
        socket.emit('room-update', null);
        return;
      }

      room.join(socket.user);

      socket.user.name = name;
      socket.room = room;
      socket.join(room.id);
      io.to(room.id).emit('room-update', room);
      console.log(`${socket.user} joined ${room}`);

      if (room.users.length === 2) {
        console.log('new vote');
        room.vote = new Vote('all');
        io.to(room.id).emit('new-vote');
      }

      if (room.vote != null) {
        room.vote.updateTotalUsers(room.users.length);
      }
    });

    socket.on('vote', () => {
      if (socket.room.vote == null) {
        return;
      }

      console.log(`${socket.user} has voted`);

      socket.room.vote.vote(socket.user);

      if (socket.room.vote.isConditionReached()) {
        io.to(socket.room.id).emit('start-game');
      }
    });

    socket.on('disconnect', () => {
      console.log(`${socket.user} disconnected`);
      socket.room?.leave(socket.user);
      io.to(socket.room?.id).emit('room-update', socket.room);
    });
  });
}
