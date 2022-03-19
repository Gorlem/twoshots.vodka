<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title">Spielst du mit?</h1>
      <h2 class="subtitle">Du kannst auswählen, ob du mitspielst oder nur zuschauen möchtest.</h2>
      <div class="buttons" ref="buttonParent">
        <button class="button is-rounded" type="button" @click="$emit('role', 'player')">
          Mitspieler 🎮
        </button>
        <button class="button is-rounded" type="button" @click="$emit('role', 'spectator')">
          Zuschauer 👀
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: [
    'role',
  ],
  mounted() {
    this.$refs.buttonParent.firstElementChild.focus();
  },
};
</script>
