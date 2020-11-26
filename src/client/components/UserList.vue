<template>
    <ul>
      <li v-for="user in users" v-bind:key="user.id">
        {{ user.id }}: {{ user.name }}
      </li>
    </ul>
</template>

<script>
export default {
  props: {
    users: Array,
  },
};
</script>
