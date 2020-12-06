<template>
  <div class="has-background-success is-relative" ref="track">
    <p class="is-size-1 is-pulled-right has-text-light mr-3">{{ name }}</p>
    <p class="is-size-1 is-unselectable">🏁</p>
    <p :style="{ right: pixel + 'px', position: 'absolute', top: 0 }" class="is-size-1 is-unselectable" ref="horse">🏇</p>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    distance: Number,
  },
  data() {
    return {
      pixel: 0,
    };
  },
  watch: {
    distance(value) {
      this.pixel = (this.$refs.track.offsetWidth - this.$refs.horse.offsetWidth) * (value / 100);
    },
  },
};
</script>
