<template>
  <section class="hero is-fullheight">
    <div class="hero-head" v-if="cardName != null">
      <div class="container">
        <div class="level m-2">
          <div class="level-left">
            <div class="level-item">
              <p class="subtitle is-5">
                <strong>{{ roomId }}</strong>
              </p>
            </div>
          </div>
          <div class="level-right" v-if="room?.vote != null">
            <div class="level-item">
              <VoteButton :data="room.vote" @submit="voteNext">Weiter geht's 👉</VoteButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    <component :is="cardName" v-if="cardName != null" :data="data" @action="action"></component>
  </section>
</template>

<script>
import StartCard from '@/components/cards/StartCard.vue';
import VoteButton from '@/components/VoteButton.vue';
import LobbyCard from '@/components/cards/LobbyCard.vue';
import InformationCard from '@/components/cards/InformationCard.vue';
import ConfirmationCard from '@/components/cards/ConfirmationCard.vue';
import InputCard from '@/components/cards/InputCard.vue';
import PollCard from '@/components/cards/PollCard.vue';
import PollResultCard from '@/components/cards/PollResultCard.vue';
import HorseRaceGame from '@/components/games/HorseRaceGame.vue';
import HorseRaceGameResults from '@/components/games/HorseRaceGameResults.vue';
import CarouselCard from '@/components/cards/CarouselCard.vue';
import DefendCastleGame from '@/components/teams/DefendCastleGame.vue';

import socket from '@/socket';

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
    PollResultCard,
    StartCard,
    CarouselCard,
    DefendCastleGame,
  },
  data() {
    return {
      cardName: null,
      data: {},
      room: {},
      roomId: '',
    };
  },
  mounted() {
    socket.on('card', (name, data) => {
      this.cardName = name;
      this.data = data;
    });

    socket.on('room', (room) => {
      this.room = room;
    });

    socket.on('room:data', (room) => {
      this.room = room;
    });

    socket.on('connect', () => {
      socket.emit('path', decodeURIComponent(window.location.pathname));
    });

    socket.on('location', (location) => {
      if (window.location.pathname !== location.path) {
        window.history.pushState(location.data, location.title, location.path);
      }
      document.title = location.title;
      this.roomId = location.data.roomId;
    });

    window.addEventListener('popstate', (event) => {
      this.roomId = event.state.roomId;
      socket.emit('path', decodeURIComponent(window.location.pathname));
    });
  },
  methods: {
    action(...payload) {
      socket.emit('card:action', ...payload);
    },
    voteNext(...payload) {
      socket.emit('room:action', ...payload);
    },
    send(...payload) {
      socket.emit(...payload);
    },
  },
};
</script>
