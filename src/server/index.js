import StartFlow from './handler/StartFlow.js';
import SetupFlow from './handler/SetupFlow.js';

import Game from './models/Game.js';
import User from './models/User.js';

const game = new Game();

function joinRoom(room, user) {
  if (room != null) {
    user.room = room;
    user.send('location', {
      data: {
        roomId: room.id,
      },
      title: `${room.id} | twoshots.vodka`,
      path: `/${room.id}`,
    });
  }

  user.handler.clear();
  user.handler.pushFlow(SetupFlow);
  user.handler.pushListener(({ role, name }) => {
    if (user.room !== room) {
      user.room?.remove(user);
    }

    user.role = role;
    user.name = name;
    user.room = room;

    if (role === 'spectator') {
      room.addSpectator(user);
    } else if (room.isInLobby()) {
      room.addPlayer(user);
    } else {
      room.addPending(user);
    }
  });
  user.handler.nextFlow({ room });
}

function start(user) {
  user.room?.remove(user);

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
      user.room = room;
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

    user.send('room:data', null);

    user.on('path', (path) => {
      if (path === '/') {
        start(user);
      } else {
        const room = game.findRoomById(path.substring(1));
        console.log(path, room);
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
    user.on('room:action', (...payload) => user.room?.action(user, ...payload));

    user.on('force-flow', (flowName) => {
      user.room.forceFlow(flowName);
    });

    user.on('disconnect', () => {
      console.log(`${user} disconnected`);
      user.room?.remove(user);
    });
  });
}
