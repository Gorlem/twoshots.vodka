<template>
  <h1 class="title">
    Namensauswahl
  </h1>
  <h2 class="subtitle">
  Hier kannst du einen Namen angeben, der deinen Mitspielern angezeigt wird.
  </h2>
  <div class="field has-addons">
    <p class="control">
      <input class="input" type="text" v-model="name" ref="input"/>
    </p>
    <p class="control">
      <button class="button is-primary" @click="submitName">Bestätigen</button>
    </p>
  </div>
</template>

<script>
export default {
  emits: [
    'submit',
  ],
  mounted() {
    this.$refs.input.focus();
  },
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
