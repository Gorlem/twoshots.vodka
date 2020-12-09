<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title">{{ name }}</h1>
      <h2 class="subtitle">{{ message }}</h2>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      name: (state) => state.data.name,
      message: (state) => state.data.message,
    }),
  },
};
</script>
