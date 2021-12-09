<template>
  <InformationCard :data="data">
    <div class="circle" ref="buttonParent" :style="'--amount: ' + data.options.length + ';'">
      <button class="button is-rounded" type="button" v-for="(option, index) in data.options" :key="option.key"
          :class="{
            'is-primary is-loading': data.selected === option.key,
            'is-static': data.selected != null && data.selected !== option.key
          }"
          :style="'--index: ' + index + ';'"
          @click="$emit('action', option.key)">
        {{ option.value }}
      </button>
    </div>
  </InformationCard>
</template>

<script>
import InformationCard from '@/components/cards/InformationCard.vue';

export default {
  components: {
    InformationCard,
  },
  props: [
    'data',
  ],
  emits: [
    'action',
  ],
  mounted() {
    this.$refs.buttonParent.firstElementChild.focus();
  },
};
</script>

<style scoped>
  .circle > * {
    --degree: calc(360deg / var(--amount) * var(--index));
    top: 50%;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%) rotate(var(--degree)) translate(min(35vh, 35vw)) rotate(calc(-1 * var(--degree)));
    clip-path: invert;
  }

  .circle::before {
    display: block;
    content: " ";
    height: min(70vh, 70vw);
    width: min(70vh, 70vw);

    border: 5px solid hsl(171, 100%, 29%);
    border-radius: 50%;

    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

  }
</style>
