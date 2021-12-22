<template>
  <InformationCard :data="data">
    <div v-for="option in data.options" :key="option.key">
      <span class="is-size-4">{{ option.value }}</span>
      <span class="tag is-primary is-medium is-pulled-right">{{ option.result }}</span>
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
};
</script>
