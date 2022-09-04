<template>
  <div class="hero-head">
    <div class="container">
      <div class="level m-2">
        <div class="level-left">
          <div class="level-item">
            <p class="subtitle is-5">
              <strong>{{ roomId }}</strong>
            </p>
          </div>
        </div>
        <div class="level-right" v-if="vote != null">
          <div class="level-item">
            <VoteButton :data="vote" @submit="roomVote">Weiter geht's 👉</VoteButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="hero-body" v-if="!connected">
    <div class="container">
      <h1 class="title">Verbindung verloren</h1>
      <h2 class="subtitle">
        Es wird automatisch versucht eine neue Verbindung aufzubauen.<br/>
        Falls dies länger als ein paar Sekunden dauert, solltest du die Seite neuladen.
      </h2>
    </div>
  </div>
  <component :is="card.name" v-if="card != null && connected" :data="card.data" @action="roomAction"></component>
</template>

<script>
import io from 'socket.io-client';

import VoteButton from '@/components/VoteButton.vue';

import LobbyCard from '@/components/cards/LobbyCard.vue';
import InformationCard from '@/components/cards/InformationCard.vue';
import ConfirmationCard from '@/components/cards/ConfirmationCard.vue';
import InputCard from '@/components/cards/InputCard.vue';
import PollCard from '@/components/cards/PollCard.vue';
import HorseRaceGame from '@/components/games/HorseRaceGame.vue';
import HorseRaceGameResults from '@/components/games/HorseRaceGameResults.vue';
import CarouselCard from '@/components/cards/CarouselCard.vue';
import DefendCastleGame from '@/components/teams/DefendCastleGame.vue';
import CanvasCard from '@/components/cards/CanvasCard.vue';
import ResultsCard from '@/components/cards/ResultsCard.vue';
import BoxesCard from '@/components/cards/BoxesCard.vue';

export default {
  components: {
    VoteButton,
    LobbyCard,
    InformationCard,
    ConfirmationCard,
    InputCard,
    HorseRaceGame,
    HorseRaceGameResults,
    PollCard,
    CarouselCard,
    DefendCastleGame,
    CanvasCard,
    ResultsCard,
    BoxesCard,
  },
  emits: [
    'update',
  ],
  props: [
    'role',
    'name',
    'roomId',
  ],
  data() {
    return {
      socket: null,
      vote: null,
      card: null,
      connected: true,
    };
  },
  mounted() {
    this.socket = io();

    window.socket = this.socket;

    this.socket.on('connect', () => {
      this.connected = true;
      this.socket.emit('room/join', this.roomId, this.role, this.name, (roomId) => {
        this.$emit('update', roomId);
      });
    });

    this.socket.on('room/vote', (vote) => {
      this.vote = vote;
    });

    this.socket.on('room/card', (card) => {
      this.card = card;
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });
  },
  methods: {
    roomVote() {
      this.socket.emit('room/vote');
    },
    roomAction(...data) {
      this.socket.emit('room/action', ...data);
    },
  },
  unmounted() {
    this.socket.disconnect();
  },
};
</script>
