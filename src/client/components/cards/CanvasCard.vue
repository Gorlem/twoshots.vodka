<template>
  <InformationCard :data="data">
    <slot/>
    <div class="canvas" ref="canvas">
      <span v-for="option in data.options" :key="option.key" :style="position(option)" @click="$emit('action', option.key)"
          :class="['is-unselectable', 'is-clickable', 'is-size-' + option.size]">
        {{ option.value }}
      </span>
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
  methods: {
    position(option) {
      return {
        left: `${option.y * 100}%`,
        top: `${option.x * 100}%`,
        position: 'absolute',
        'z-index': 100 - option.key,
      };
    },
  },
};
</script>

<style scoped>
.canvas {
  height: 50vh;
  width: 80vw;
  position: relative;
}
</style>
