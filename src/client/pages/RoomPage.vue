<template>
  <section class="hero is-fullheight">
    <RoleSelection v-if="roleRequired" @role="setRole"/>
    <NameSelection v-else-if="nameRequired" @name="setName"/>
    <GameRoom v-else :role="role" :name="name" :roomId="roomId" @update="updateRoomId"/>
  </section>
</template>

<script>
import RoleSelection from '@/components/RoleSelection.vue';
import NameSelection from '@/components/NameSelection.vue';
import GameRoom from '@/components/GameRoom.vue';

export default {
  emits: [
    'update',
    'navigate',
  ],
  components: {
    RoleSelection,
    NameSelection,
    GameRoom,
  },
  data() {
    return {
      role: null,
      name: null,
      roomId: null,
    };
  },
  mounted() {
    this.role = sessionStorage.getItem('role');
    this.name = sessionStorage.getItem('name');

    this.roomId = decodeURI(window.location.pathname.slice(1));
  },
  methods: {
    setRole(role) {
      this.role = role;
      sessionStorage.setItem('role', role);
    },
    setName(name) {
      this.name = name;
      sessionStorage.setItem('name', name);
    },
    updateRoomId(roomId) {
      if (roomId == null) {
        this.$emit('navigate', '/');
      } else {
        this.roomId = roomId;
        this.$emit('update', `/${roomId}`);
      }
    },
  },
  computed: {
    roleRequired() {
      return this.role == null;
    },
    nameRequired() {
      return this.role === 'player' && this.name == null;
    },
  },
};
</script>
