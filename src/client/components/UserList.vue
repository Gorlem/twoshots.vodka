<template>
    <div class="tags">
      <span class="tag is-rounded" v-for="user in users" v-bind:key="user">
        {{ user }}
      </span>
    </div>
</template>

<script>
export default {
  props: {
    users: Array,
  },
};
</script>
