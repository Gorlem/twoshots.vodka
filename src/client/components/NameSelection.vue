<template>
  <div>
    <input type="text" v-model="name"/>
    <button type="button" @click="submitName">Set Name</button>
  </div>
</template>

<script>
export default {
  emits: [
    'submit',
  ],
  data() {
    return {
      name: '',
    };
  },
  methods: {
    submitName() {
      this.$emit('submit', this.name);
    },
  },
};
</script>
