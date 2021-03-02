import StartFlow from './handler/StartFlow.js';
import SetupFlow from './handler/SetupFlow.js';

import Game from './models/Game.js';
import User from './models/User.js';

const game = new Game();

function joinRoom(room, user) {
  user.handler.clear();
  user.handler.pushFlow(SetupFlow);
  user.handler.nextFlow({ room });
}

function start(user) {
  user.handler.clear();
  user.handler.pushFlow(StartFlow);
  user.handler.pushListener(({ roomId }) => {
    let room;
    if (roomId == null) {
      room = game.createRoom();
    } else {
      room = game.findRoomById(roomId);
    }

    if (room != null) {
      user.send('location', {
        data: {
          roomId: room.id,
        },
        title: `${room.id} | twoshots.vodka`,
        path: `/${room.id}`,
      });
    }

    startOrJoinRoom(room, user);
  });
  user.handler.nextFlow();
}

function startOrJoinRoom(room, user) {
  if (room == null) {
    start(user);
  } else {
    joinRoom(room, user);
  }
}

export default function (io) {
  io.on('connection', (socket) => {
    const user = new User(socket);
    socket.user = user;

    user.on('path', (path) => {
      if (path === '/') {
        start(user);
      } else {
        const room = game.findRoomById(path.substring(1));

        if (room == null) {
          user.send('location', {
            data: {
              roomId: '',
            },
            title: 'twoshots.vodka',
            path: '/',
          });
        }

        startOrJoinRoom(room, user);
      }
    });

    user.on('card:action', (...payload) => user.handler.action(user, ...payload));
  });
}
