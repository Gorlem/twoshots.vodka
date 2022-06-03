<template>
  <InformationCard :data="data">
    <div class="buttons" ref="buttonParent">
      <button class="button is-rounded" type="button" v-for="option in data.options" :key="option.key"
          :class="{ 'is-primary is-loading': data.selected === option.key, ['is-size-' + option.size]: true }"
          :disabled="data.selected != null" @click="$emit('action', option.key)">
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
