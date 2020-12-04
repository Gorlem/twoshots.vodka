import Game from './models/Game.js';
import User from './models/User.js';

import LobbyCard from './cards/LobbyCard.js';

import io from './io.js';

const game = new Game();

io.on('connection', (socket) => {
  socket.user = new User(socket);

  socket.on('has-room', (roomId, callback) => {
    const room = game.findRoomById(roomId);
    callback(room != null);
  });

  socket.on('create-room', (callback) => {
    socket.room?.leave(socket.user);
    const room = game.createRoom();
    room.setCard(new LobbyCard(room));
    callback(room.id);
  });

  socket.on('join-room', (roomId, name) => {
    socket.room?.leave(socket.user);
    const room = game.findRoomById(roomId);
    const { user } = socket;

    if (room == null) {
      socket.emit('room-update', null);
      return;
    }

    socket.room = room;
    user.name = name;

    room.join(user);
  });

  socket.on('disconnect', () => {
    socket.room?.leave(socket.user);
  });
});
