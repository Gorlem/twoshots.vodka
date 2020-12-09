<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title">
        Willkommen zu <em class="has-text-primary">twoshots.vodka</em>!
      </h1>
      <h2 class="subtitle">
        Hier kannst du entweder einen neuen Raum erstellen, oder einem bestehenden Raum beitreten.
      </h2>

      <div class="columns">
        <div class="column">
          <button @click="createRoom" class="button is-primary">Raum erstellen</button>
        </div>
        <div class="column">
          <datalist id="drinks">
            <option :value="name" v-for="name in names" :key="name"/>
          </datalist>
          <div class="field has-addons">
            <p class="control">
              <input class="input" type="text" list="drinks" v-model="left" ref="input"/>
            </p>
            <p class="control">
              <span class="button is-static">mit</span>
            </p>
            <p class="control">
              <input class="input" type="text" list="drinks" v-model="right"/>
            </p>
          </div>
          <p class="control">
              <button class="button is-primary" @click="joinRoom">Raum beitreten</button>
            </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from '../socket';

export default {
  data() {
    return {
      left: '',
      right: '',
      names: [],
    };
  },
  created() {
    socket.emit('leave-room');

    socket.emit('names', (names) => {
      this.names = names;
    });
  },
  mounted() {
    this.$refs.input.focus();
  },
  computed: {
    roomId() {
      return `${this.left}-mit-${this.right}`;
    },
  },
  methods: {
    createRoom() {
      socket.emit('create-room', (roomId) => {
        this.$router.push({ name: 'Room', params: { roomId } });
      });
    },
    joinRoom() {
      this.$router.push({ name: 'Room', params: { roomId: this.roomId } });
    },
  },
};
</script>
