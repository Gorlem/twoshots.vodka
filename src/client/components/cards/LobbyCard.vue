<template>
  <div class="hero-body">
    <div class="container">
      <RoomId :room-id="roomId"/>
      <UserList :users="users"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import UserList from '@/components/UserList.vue';
import RoomId from '@/components/RoomId.vue';

export default {
  components: {
    UserList,
    RoomId,
  },
  computed: {
    ...mapState({
      roomId: (state) => state.roomId,
      users: (state) => state.data?.users,
    }),
  },
};
</script>
