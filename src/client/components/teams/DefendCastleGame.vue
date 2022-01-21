<template>
  <div class="hero-body has-background-info tug-of-war" @click="$emit('action')">
    <div class="container">
      <h1 class="title has-text-light is-unselectable" v-html="data?.title"></h1>
      <h2 class="subtitle has-text-light is-unselectable" v-html="data?.message"></h2>
      <div class="has-background-info-dark is-relative" ref="field">
        <p class="is-size-4 is-unselectable has-text-light mr-3 is-pulled-right">{{ data.right }} 🏰</p>
        <p class="is-size-4 is-unselectable has-text-light ml-3">🏰 {{ data.left }}</p>
        <p :style="{ left: pixel + 'px', position: 'absolute', top: 0 }" class="is-size-4 is-unselectable" ref="tug">🤜⚔🤛</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'data',
  ],
  emits: [
    'action',
  ],
  data() {
    return {
      pixel: 0,
    };
  },
  mounted() {
    this.calculatePixel();
  },
  watch: {
    'data.score': 'calculatePixel',
  },
  methods: {
    calculatePixel() {
      this.pixel = ((this.$refs.field.offsetWidth - this.$refs.tug.offsetWidth) / 200) * (100 + this.data.score);
    },
  },
};
</script>

<style scoped>
.tug-of-war {
  touch-action: manipulation;
}
</style>
