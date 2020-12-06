<template>
  <div class="field has-addons">
    <p class="control">
      <button class="button is-primary" :class="{ 'is-loading': hasVoted }" type="button" @click="vote">
        <slot/>
      </button>
    </p>
    <p class="control">
      <span class="button is-static" type="button">
        {{ voteStatus }}
      </span>
    </p>
  </div>
</template>

<script>
import socket from '@/socket';

export default {
  data() {
    return {
      required: 0,
      voted: 0,
      hasVoted: false,
    };
  },
  props: [
    'namespace',
    'data',
  ],
  created() {
    socket.on(`${this.namespace}:update`, (votes) => {
      this.required = votes.required;
      this.voted = votes.voted;
    });
    socket.on('card:name', () => {
      this.hasVoted = false;
    });
  },
  computed: {
    voteStatus() {
      return `${this.voted} / ${this.required}`;
    },
  },
  methods: {
    vote() {
      if (this.hasVoted) {
        return;
      }

      socket.emit(`${this.namespace}:submit`, this.data);
      this.hasVoted = true;
    },
  },
};
</script>
