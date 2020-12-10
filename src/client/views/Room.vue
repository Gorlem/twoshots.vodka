<template>
  <div class="hero-head" v-if="cardName != null">
    <div class="container">
      <div class="level m-2">
        <div class="level-left">
          <div class="level-item">
            <p class="subtitle is-5">
              Raum <strong>{{ roomId }}</strong>
            </p>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <VoteButton :data="voteData" @submit="voteNext">Weiter</VoteButton>
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
import { mapState, mapActions } from 'vuex';

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
  computed: {
    ...mapState({
      cardName: (state) => state.card,
      roomId: (state) => state.roomId,
      voteData: (state) => state.room.vote,
    }),
  },
  methods: {
    setName(name) {
      socket.emit('join-room', this.$route.params.roomId, name, (roomId) => {
        if (roomId == null) {
          this.$router.replace({ name: 'RoomSelection' });
        } else if (roomId !== this.$route.params.roomId) {
          this.$router.replace({ name: 'Room', params: { roomId: this.roomId } });
        }
      });
    },
    ...mapActions({
      voteNext: 'doRoomAction',
    }),
  },
};
</script>
