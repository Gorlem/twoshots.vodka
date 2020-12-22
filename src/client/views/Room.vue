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
  <component :is="cardName" v-if="cardName != null" :data="data" @action="action"></component>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import NameSelection from '@/components/NameSelection.vue';
import VoteButton from '@/components/VoteButton.vue';
import LobbyCard from '@/components/cards/LobbyCard.vue';
import InformationCard from '@/components/cards/InformationCard.vue';
import ConfirmationCard from '@/components/cards/ConfirmationCard.vue';
import InputCard from '@/components/cards/InputCard.vue';
import HorseRaceGame from '@/components/games/HorseRaceGame.vue';
import HorseRaceGameResults from '@/components/games/HorseRaceGameResults.vue';

import socket from '@/socket';

export default {
  components: {
    NameSelection,
    VoteButton,
    LobbyCard,
    InformationCard,
    ConfirmationCard,
    InputCard,
    HorseRaceGame,
    HorseRaceGameResults,
  },
  computed: {
    ...mapState({
      cardName: (state) => state.card,
      roomId: (state) => state.roomId,
      voteData: (state) => state.room.vote,
      data: (state) => state.data,
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
      action: 'doCardAction',
    }),
  },
};
</script>
