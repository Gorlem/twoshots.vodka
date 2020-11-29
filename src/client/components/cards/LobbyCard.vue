<template>
  <div>
    <RoomId :room-id="roomId"/>
    <UserList :users="users"/>
    <button type="button" @click="vote">Vote!</button>
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
  computed: {
    ...mapState({
      roomId: (state) => state.room.id,
      users: (state) => state.room.users,
    }),
  },
  methods: {
    vote() {
      socket.emit('vote');
    },
  },
};
</script>
