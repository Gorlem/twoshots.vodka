<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title">Hier könnte ihr Name stehen</h1>
      <h2 class="subtitle">Bitte gib einen Namen ein. Deine Mitspieler werden diesen Namen sehen.</h2>
      <div class="field has-addons">
        <p class="control">
          <input class="input" v-model="name" @keydown.enter="$emit('name', name)" ref="input"/>
        </p>
        <p class="control">
          <button type="button" class="button is-primary" @click="checkName">
            Bestätigen ☝
          </button>
        </p>
      </div>
      <div class="has-text-danger">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      error: '',
    };
  },
  emits: [
    'name',
  ],
  mounted() {
    this.$refs.input.focus();
  },
  methods: {
    checkName() {
      this.error = '';

      if (this.name.length < 1) {
        this.error = 'Du musst einen Namen angeben!';
      }

      if (this.name.length > 10) {
        this.error = 'Dein Name darf nicht länger als 10 Zeichen sein!';
      }

      if (this.error === '') {
        this.$emit('name', this.name);
      }
    },
  },
};
</script>
