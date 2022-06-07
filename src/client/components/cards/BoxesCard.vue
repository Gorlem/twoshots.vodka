<template>
  <InformationCard :data="data">
    <slot/>
    <div class="boxes" ref="boxes" :style="grid()">
      <span v-for="option in data.options" :key="option.key" @click="$emit('action', option.key)"
          :class="['has-background-' + option.value]">
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
    grid() {
      return {
        'grid-template-columns': `repeat(${this.data.columns}, 1fr)`,
        'grid-template-rows': `repeat(${this.data.rows}, 1fr)`,
      };
    },
  },
};
</script>

<style scoped>
.boxes {
  height: 50vh;
  width: 80vw;

  display: grid;
  gap: 5px;
}
</style>
