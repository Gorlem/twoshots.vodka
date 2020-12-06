import { createStore } from 'vuex';

import createSocketPlugin from './socketPlugin';
import socket from '../socket';

export default createStore({
  state() {
    return {
      room: {},
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
  },
  actions: {
    doCardAction(context, data) {
      socket.emit('card:action', data);
    },
  },
  plugins: [
    createSocketPlugin(socket),
  ],
});
