<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title" v-html="data?.title"></h1>
      <h2 class="subtitle" v-html="data?.message" v-if="data?.message"></h2>
      <slot/>
      <div v-html="data?.footer"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'data',
  ],
};
</script>
