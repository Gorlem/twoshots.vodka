<template>
  <span v-for="text in texts" :key="text">
    <template v-if="text.type == 'text'">
      {{ text.content }}
    </template>
    <template v-if="text.type == 'user'">
      <strong class="has-text-primary">{{ text.content }}</strong>
    </template>
    <template v-if="text.type == 'highlight'">
      <strong class="has-text-primary">{{ text.content }}</strong>
    </template>
    <template v-if="text.type == 'link'">
      <a :href="text.content" class="link" target="_blank">{{ domain(text.content) }}</a>
    </template>
  </span>
</template>

<script>
export default {
  props: ['texts'],
  methods: {
    domain(url) {
      return new URL(url).hostname;
    },
  },
};
</script>
