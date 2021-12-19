<template>
  <div class="hero-body has-background-success-dark race-game" @click="$emit('action')">
    <div class="container">
      <Track :distance="data.track.distance"/>
    </div>
  </div>
</template>

<script>
import Track from '@/components/Track.vue';

export default {
  components: {
    Track,
  },
  props: [
    'data',
  ],
  emits: [
    'action',
  ],
};
</script>

<style>
.race-game {
  touch-action: manipulation;
}
</style>
