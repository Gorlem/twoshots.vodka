<template>
  <InformationCard :data="data">
    <div v-for="result in data.results" :key="result[0]">
      <span class="is-pulled-right is-size-1">{{ result[0] }}</span>
      <span class="is-size-1">{{result[1]}}x ☝</span>
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
