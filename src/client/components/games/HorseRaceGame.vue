<template>
  <div class="hero-body has-background-success-dark" @click="tap">
    <div class="container">
      <Track v-for="track in tracks" :key="track.name" :name="track.name" :distance="track.distance"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

import Track from '@/components/Track.vue';

export default {
  components: [
    Track,
  ],
  computed: {
    ...mapMutations({
      tracks: (state) => state.data?.tracks,
    }),
  },
  methods: {
    ...mapActions({
      tap: 'doCardAction',
    }),
  },
};
</script>
