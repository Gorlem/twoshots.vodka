<template>
  <div class="hero-body has-background-success-dark" @click="$emit('action')">
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
