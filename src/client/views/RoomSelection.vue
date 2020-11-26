<template>
  <div>
    <button @click="createRoom">Create Room</button>
    <hr/>
    <input type="text" pattern="[0-9]*" inputmode="numeric" v-model="roomId"/>
    <button @click="joinRoom">Join Room</button>
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
