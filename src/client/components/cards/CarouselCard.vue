<template>
  <InformationCard :data="data">
    <div class="circle" ref="buttonParent" :style="'--amount: ' + data.options.length + ';'">
      <button class="button is-rounded" type="button" v-for="(option, index) in data.options" :key="option.key"
          :class="{
            'is-primary is-loading': data.selected === option.key,
            'is-static': (data.selected != null && data.selected !== option.key) || (option.static && (data.selected !== option.key)),
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
    transform: translate(-50%, -50%) rotate(var(--degree)) translate(min(25vh, 25vw)) rotate(calc(-1 * var(--degree)));
    clip-path: invert;
  }

  .circle {
    height: min(50vh, 50vw);
    width: min(50vh, 50vw);
    position: relative;
    margin: 5em;
  }

  .circle::before {
    display: block;
    content: " ";
    height: inherit;
    width: inherit;

    border: 5px solid hsl(171, 100%, 29%);
    border-radius: 50%;
  }
</style>
