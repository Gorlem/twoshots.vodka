<template>
  <div class="hero-head" v-if="cardName != null">
    <div class="container">
      <div class="level is-mobile m-2">
        <div class="level-left">
          <div class="level-item">
            <p class="subtitle is-5">
              Raum <strong>{{ roomId }}</strong>
            </p>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <VoteButton namespace="card:next" data="true">Nächste Karte</VoteButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="hero-body" v-if="cardName == null">
    <div class="container">
      <NameSelection @submit="setName"/>
    </div>
  </div>
  <component :is="cardName" v-if="cardName != null"></component>
</template>

<script>
import { mapState } from 'vuex';

import NameSelection from '@/components/NameSelection.vue';
import VoteButton from '@/components/VoteButton.vue';
import LobbyCard from '@/components/cards/LobbyCard.vue';
import InstructionCard from '@/components/cards/InstructionCard.vue';
import GuessCard from '@/components/cards/GuessCard.vue';
import HorseRaceGame from '@/components/games/HorseRaceGame.vue';

import socket from '@/socket';

export default {
  components: {
    NameSelection,
    VoteButton,
    LobbyCard,
    InstructionCard,
    GuessCard,
    HorseRaceGame,
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
      roomId: (state) => state.room.id,
    }),
  },
  methods: {
    setName(name) {
      socket.emit('join-room', this.$route.params.roomId, name);
    },
  },
};
</script>
