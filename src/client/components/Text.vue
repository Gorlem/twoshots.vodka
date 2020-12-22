<template>
  <span v-for="text in texts" :key="text">
    <template v-if="text.type === 'text'">
      {{ text.content }}
    </template>
    <template v-if="text.type === 'user'">
      <strong class="has-text-primary">{{ text.content }}</strong>
    </template>
    <template v-if="text.type === 'highlight'">
      <strong class="has-text-primary">{{ text.content }}</strong>
    </template>
  </span>
</template>

<script>
export default {
  props: ['texts'],
};
</script>
