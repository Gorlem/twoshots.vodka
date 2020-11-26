<template>
  <div>
    <Lobby v-if="status == 'lobby'"/>
    <NameSelection v-if="status == 'name_selection'" @submit="setName"/>
    <StartGame v-if="status == 'playing'"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import NameSelection from '@/components/NameSelection.vue';
import Lobby from '@/components/Lobby.vue';
import StartGame from '@/components/cards/StartGame.vue';

import socket from '@/socket';

export default {
  components: {
    NameSelection,
    Lobby,
    StartGame,
  },
  created() {
    this.$store.commit('UPDATE_STATUS', 'name_selection');

    socket.once('start-game', () => {
      this.$store.commit('UPDATE_STATUS', 'playing');
    });
  },
  computed: {
    ...mapState({
      roomId: (state) => state.room.id,
      users: (state) => state.room.users,
      status: (state) => state.room.status,
    }),
  },
  methods: {
    setName(name) {
      socket.emit('join-room', this.$route.params.roomId, name);
      this.$store.commit('UPDATE_STATUS', 'lobby');
    },
  },
};
</script>
