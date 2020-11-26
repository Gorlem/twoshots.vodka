<template>
  <div>
    <RoomId :room-id="roomId"/>
    <UserList :users="users"/>
    <button type="button" v-if="hasVote" @click="vote">Vote!</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import UserList from '@/components/UserList.vue';
import RoomId from '@/components/RoomId.vue';

import socket from '@/socket';

export default {
  components: {
    UserList,
    RoomId,
  },
  data() {
    return {
      hasVote: false,
    };
  },
  created() {
    socket.on('room-update', (room) => {
      this.$store.commit('UPDATE_ROOM', room);
    });

    socket.on('new-vote', () => {
      this.hasVote = true;
    });
  },
  computed: {
    ...mapState({
      roomId: (state) => state.room.id,
      users: (state) => state.room.users,
      status: (state) => state.room.status,
    }),
  },
  methods: {
    vote() {
      socket.emit('vote');
    },
  },
};
</script>
