<template>
  <InformationCard :data="data">
    <slot/>
    <VoteButton :data="data?.vote" @submit="$emit('action')" v-if="data.button !== false">{{data.button || 'Bestätigen'}}</VoteButton>
  </InformationCard>
</template>

<script>
import VoteButton from '@/components/VoteButton.vue';
import InformationCard from '@/components/cards/InformationCard.vue';

export default {
  components: {
    VoteButton,
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
