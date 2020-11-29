import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      room: {},
      card: {},
    };
  },
  mutations: {
    UPDATE_ROOM(state, room) {
      state.room = room;
    },
    UPDATE_CARD(state, card) {
      state.card = card;
    },
  },
});
