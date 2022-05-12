<template>
  <InformationCard :data="data">
    <div class="field has-addons">
      <p class="control">
        <input class="input" :type="type" :inputmode="inputmode" v-model="guess" :disabled="data.selected"
            @keydown.enter="$emit('action', guess)" ref="input"/>
      </p>
      <p class="control" v-if="data?.hint != null">
        <span class="button is-static" type="button">
          {{ data.hint }}
        </span>
      </p>
      <p class="control">
        <button type="button" class="button is-primary" :class="{ 'is-loading': data.selected }"
            :disabled="data.selected" @click="$emit('action', guess)">
          {{ data.button }}
        </button>
      </p>
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
  data() {
    return {
      guess: '',
    };
  },
  mounted() {
    this.$refs.input.focus();
  },
  activated() {
    this.$refs.input.focus();
  },
  computed: {
    type() {
      return this.data.type === 'number' ? 'number' : 'text';
    },
    inputmode() {
      return this.data.type === 'number' ? 'decimal' : 'text';
    },
  },
};
</script>
