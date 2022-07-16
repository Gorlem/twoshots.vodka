<template>
  <InformationCard :data="data">
    <slot/>
    <div class="canvas">
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
        left: `${option.y * 95}%`,
        top: `${option.x * 95}%`,
        position: 'absolute',
        'z-index': 100 - option.key,
      };
    },
  },
};
</script>

<style scoped>
.hero.is-fullheight .hero-body:deep(.container) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero.is-fullheight .hero-body {
  align-items: stretch !important;
}

.canvas {
  align-self: stretch;
  height: 100%;
  position: relative;
}
</style>
