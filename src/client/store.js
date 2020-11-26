import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      room: {
        id: null,
        users: [],
        status: null,
      },
    };
  },
  mutations: {
    UPDATE_ROOM(state, room) {
      state.room.id = room.id;
      state.room.users = room.users.map((user) => ({ id: user.id, name: user.name }));
    },
    UPDATE_STATUS(state, status) {
      state.room.status = status;
    },
  },
});
