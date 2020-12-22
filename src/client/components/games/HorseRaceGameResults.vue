<template>
  <InformationCard :data="data">
    <Track v-for="track in data.tracks" :key="track.name" :name="track.name" :distance="track.distance"/>
  </InformationCard>
</template>

<script>
import Track from '@/components/Track.vue';
import InformationCard from '@/components/cards/InformationCard.vue';

export default {
  components: {
    Track,
    InformationCard,
  },
  props: [
    'data',
  ],
};
</script>
