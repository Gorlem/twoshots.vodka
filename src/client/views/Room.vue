<template>
  <NameSelection v-if="cardName == null" @submit="setName"/>
  <component :is="cardName"></component>
</template>

<script>
import { mapState } from 'vuex';

import NameSelection from '@/components/NameSelection.vue';
import LobbyCard from '@/components/cards/LobbyCard.vue';
import StartGameCard from '@/components/cards/StartGameCard.vue';

import socket from '@/socket';

export default {
  components: {
    NameSelection,
    LobbyCard,
    StartGameCard,
  },
  created() {
    this.$store.commit('UPDATE_CARD', {});

    socket.on('card', (card) => {
      this.$store.commit('UPDATE_CARD', card);
    });

    socket.on('room-update', (room) => {
      this.$store.commit('UPDATE_ROOM', room);
    });
  },
  computed: {
    ...mapState({
      cardName: (state) => state.card.name,
    }),
  },
  methods: {
    setName(name) {
      socket.emit('join-room', this.$route.params.roomId, name);
    },
  },
};
</script>
