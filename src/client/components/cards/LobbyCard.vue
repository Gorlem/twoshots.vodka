<template>
  <div class="hero-body">
    <div class="container">
      <RoomId :room-id="roomId"/>
      <UserList :users="data.users"/>
      <VoteButton :data="data.vote" @submit="$emit('action')">Bestätigen</VoteButton>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import UserList from '@/components/UserList.vue';
import RoomId from '@/components/RoomId.vue';
import VoteButton from '@/components/VoteButton.vue';

export default {
  components: {
    UserList,
    RoomId,
    VoteButton,
  },
  computed: {
    ...mapState({
      roomId: (state) => state.roomId,
    }),
  },
  props: [
    'data',
  ],
  emits: [
    'action',
  ],
};
</script>
