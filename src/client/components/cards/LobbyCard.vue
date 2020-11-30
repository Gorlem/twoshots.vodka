<template>
  <div>
    <RoomId :room-id="roomId"/>
    <UserList :users="users"/>
    <button class="button" type="button" @click="vote">Es kann losgehen {{ voteStatus }}</button>
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
      required: 0,
      voted: 0,
    };
  },
  created() {
    socket.on('vote:update', (votes) => {
      this.required = votes.required;
      this.voted = votes.voted;
    });
  },
  computed: {
    voteStatus() {
      return `${this.voted} / ${this.required}`;
    },
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
