<template>
  <div class="field has-addons">
    <p class="control">
      <button class="button is-primary is-medium" :class="{ 'is-loading': hasVoted }" type="button" @click="vote">
        <slot/>
      </button>
    </p>
    <p class="control" v-if="data != null">
      <span class="button is-static is-medium">
        {{ voteStatus }}
      </span>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hasVoted: false,
    };
  },
  props: [
    'data',
  ],
  emits: [
    'submit',
  ],
  computed: {
    voteStatus() {
      return `${this.data?.voted} / ${this.data?.required}`;
    },
  },
  methods: {
    vote() {
      if (this.hasVoted) {
        return;
      }

      this.$emit('submit');
      this.hasVoted = true;
    },
  },
  watch: {
    data() {
      if (this.data.voted === 0) {
        this.hasVoted = false;
      }
    },
  },
};
</script>
