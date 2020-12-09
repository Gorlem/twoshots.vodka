import { createStore, createLogger } from 'vuex';

import createSocketPlugin from './socketPlugin';
import socket from '../socket';

export default createStore({
  state() {
    return {
      roomId: null,
      room: {},
      votedRoom: false,
      card: null,
      data: {},
    };
  },
  mutations: {
    UPDATE_ROOM(state, room) {
      state.room = room;
    },
    UPDATE_CARD(state, card) {
      state.card = card;
    },
    'SOCKET_CARD:NAME': (state, [name]) => {
      state.card = name;
    },
    'SOCKET_CARD:DATA': (state, [data]) => {
      state.data = data;
    },
    'SOCKET_ROOM:DATA': (state, [data]) => {
      state.room = data;
    },
    'SOCKET_ROOM:ID': (state, [id]) => {
      state.roomId = id;
    },
  },
  actions: {
    doCardAction(context, data) {
      socket.emit('card:action', data);
    },
    doRoomAction() {
      socket.emit('room:action');
    },
  },
  plugins: [
    createSocketPlugin(socket),
    createLogger(),
  ],
});
