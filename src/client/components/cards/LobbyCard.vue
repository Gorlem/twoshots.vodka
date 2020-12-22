<template>
  <div class="hero-body">
    <div class="container">
      <RoomId :room-id="roomId"/>
      <UserList :users="data.users"/>
      <VoteButton :data="data.vote" @submit="vote()">Bestätigen</VoteButton>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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
      data: (state) => state.data,
    }),
  },
  methods: {
    ...mapActions({
      vote: 'doCardAction',
    }),
  },
};
</script>
