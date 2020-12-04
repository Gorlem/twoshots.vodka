<template>
  <div class="hero-body has-background-success-dark" @click="tap">
    <div class="container" ref="track">
      <div class="has-background-success is-relative" v-for="track in tracks" :key="track.name">
        <p class="is-size-1 is-pulled-right has-text-light mr-3">{{track.name}}</p>
        <p class="is-size-1 is-unselectable">🏁</p>
        <p :style="{ right: track.pixel + 'px', position: 'absolute', top: 0 }" class="is-size-1 is-unselectable">🏇</p>
      </div>
    </div>
  </div>
</template>

<script>
import socket from '../../socket.js';

export default {
  data() {
    return {
      tracks: [
        {
          name: '',
          distance: 0,
          pixel: 0,
        },
      ],
    };
  },
  created() {
    socket.on('card:game:horse:update', (tracks) => {
      if (this.$refs.track == null) {
        return;
      }

      for (const track of tracks) {
        track.pixel = (this.$refs.track.offsetWidth - 66) * (Number.parseInt(track.distance, 10) / 100);
      }
      this.tracks = tracks;
    });
  },
  methods: {
    tap() {
      socket.emit('card:game:horse:tap');
    },
  },
};
</script>
