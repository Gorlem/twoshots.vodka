<template>
  <InformationCard :data="data">
    <slot/>
    <button class="button" type="button" :class="{ 'is-primary is-loading': data.selected != null }"
        :disabled="data.selected != null" @click="$emit('action')" v-if="data.button != null">
      {{ data.button }}
    </button>
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
};
</script>
