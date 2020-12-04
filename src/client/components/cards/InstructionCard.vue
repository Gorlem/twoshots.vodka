<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title">{{ title }}</h1>
      <h2 class="subtitle">{{ message }}</h2>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      title: (state) => state.card.data.title,
      message: (state) => state.card.data.message,
    }),
  },
};
</script>
