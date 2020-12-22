<template>
  <ConfirmationCard :data="data" @action="$emit('action', guess)">
    <div class="field has-addons">
      <p class="control">
        <input class="input" type="number" v-model="guess" ref="input"/>
      </p>
      <p class="control" v-if="data.hint != null">
        <span class="button is-static" type="button">
          {{ data.hint }}
        </span>
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
      guess: '',
    };
  },
  mounted() {
    this.$refs.input.focus();
  },
};
</script>
