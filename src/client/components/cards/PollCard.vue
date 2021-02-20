<template>
  <ConfirmationCard :data="data" @action="$emit('action', selected)">
    <div class="field is-grouped">
      <p class="control" v-for="option in data.options" :key="option.key">
        <button class="button is-rounded" :class="{ 'is-primary': selected == option.key }" @click="selected = option.key">
          {{option.value}}
        </button>
      </p>
    </div>
  </ConfirmationCard>
</template>

<script>
import ConfirmationCard from '@/components/cards/ConfirmationCard.vue';

export default {
  components: {
    ConfirmationCard,
  },
  props: [
    'data',
  ],
  emits: [
    'action',
  ],
  data() {
    return {
      selected: '',
    };
  },
};
</script>
