<template>
  <div class="hero-body" v-if="data.vote">
    <div class="container">
      <h1 class="title">{{ data.title }}</h1>
      <h2 class="subtitle">{{ data.message }}</h2>

      <VoteButton :data="data.vote" @submit="action">Bestätigen</VoteButton>
    </div>
  </div>
  <div class="hero-body has-background-success-dark" @click="action" v-if="tracks">
    <div class="container">
      <h1 class="title has-text-light">{{ data.title }}</h1>
      <h2 class="subtitle has-text-light">{{ data.message }}</h2>
      <Track v-for="track in tracks" :key="track.name" :name="track.name" :distance="track.distance"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Track from '@/components/Track.vue';
import VoteButton from '@/components/VoteButton.vue';

export default {
  components: {
    Track,
    VoteButton,
  },
  computed: {
    ...mapState({
      tracks: (state) => state.data?.tracks,
      data: (state) => state.data,
    }),
  },
  methods: {
    ...mapActions({
      action: 'doCardAction',
    }),
  },
};
</script>
