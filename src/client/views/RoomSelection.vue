<template>
  <h1 class="title">
    Willkommen zu <em>drinking-game</em>!
  </h1>
  <h2 class="subtitle">
    Hier kannst du entweder einen neuen Raum erstellen, oder einem bestehenden Raum beitreten.
  </h2>

  <div class="columns">
    <div class="column">
      <button @click="createRoom" class="button">Raum erstellen</button>
    </div>
    <div class="column">
      <div class="field has-addons">
        <p class="control">
          <input class="input" type="text" pattern="[0-9]*" inputmode="numeric" v-model="roomId" ref="input"/>
        </p>
        <p class="control">
          <button class="button" @click="joinRoom">Raum beitreten</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import socket from '../socket';

export default {
  data() {
    return {
      roomId: '',
    };
  },
  mounted() {
    this.$refs.input.focus();
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
