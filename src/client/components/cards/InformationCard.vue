<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title"><Text :texts="data.title"/></h1>
      <h2 class="subtitle"><Text :texts="data.message"/></h2>
      <slot/>
      <div><Text :texts="data.footer"/></div>
    </div>
  </div>
</template>

<script>
import Text from '../Text.vue';

export default {
  components: {
    Text,
  },
  props: [
    'data',
  ],
};
</script>
