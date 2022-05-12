<template>
  <section class="hero is-fullheight">
    <div class="hero-body">
      <div class="container">
        <h1 class="title">Willkommen zu <strong class="has-text-primary shake">twoshots.vodka</strong></h1>
        <h2 class="subtitle">
          <strong class="has-text-primary">twoshots.vodka</strong> ist ein kooperatives Trinkspiel.
          Jeder von euch nutzt sein eigenes Smartphone, um einem gemeinsamen Raum beizutreten.
        </h2>
        <div class="columns">
          <div class="column">
            <button @click="createRoom" class="button is-primary">Raum erstellen</button>
          </div>
          <div class="column">
            <datalist id="drinks">
              <option :value="name" v-for="name in data.names" :key="name"/>
            </datalist>
            <div class="field has-addons">
              <p class="control">
                <input class="input" type="text" list="drinks" :placeholder="placeholderLeft"
                  v-model="left" @keydown.enter="$refs.right.focus()" ref="left"/>
              </p>
              <p class="control">
                <span class="button is-static">mit</span>
              </p>
              <p class="control">
                <input class="input" type="text" list="drinks" :placeholder="placeholderRight"
                  v-model="right" @keydown.enter="joinRoom" ref="right"/>
              </p>
            </div>
            <p class="control">
              <button class="button is-primary" @click="joinRoom">Raum beitreten</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.shake {
  display: inline-block;
  animation: shaking 0.5s infinite alternate ease-in-out;
}

@keyframes shaking {
  0% {
    transform: translateX(2px);
  }

  100% {
    transform: translateX(-2px) rotate(2deg);
  }
}
</style>

<script>
import io from 'socket.io-client';

export default {
  emits: [
    'navigate',
  ],
  data() {
    return {
      left: '',
      right: '',
      placeholderLeft: '',
      placeholderRight: '',
      timer: null,
      data: {
        names: [],
      },
    };
  },
  mounted() {
    this.$refs.left.focus();

    const socket = io();

    socket.emit('parts', (parts) => {
      this.data.names = parts;

      this.placeholderLeft = this.randomPart();
      this.placeholderRight = this.randomPart();

      this.timer = setInterval(this.updatePlaceholder, 5000);

      socket.close();
    });
  },
  methods: {
    randomPart() {
      const number = Math.floor(Math.random() * this.data.names.length);
      return this.data.names[number];
    },
    updatePlaceholder() {
      if (Math.random() > 0.5) {
        this.placeholderLeft = this.randomPart();
      } else {
        this.placeholderRight = this.randomPart();
      }
    },
    createRoom() {
      this.$emit('navigate', '/new');
    },
    joinRoom() {
      this.$emit('navigate', `/${this.left.trim().toLowerCase()}-mit-${this.right.trim().toLowerCase()}`);
    },
  },
};
</script>
