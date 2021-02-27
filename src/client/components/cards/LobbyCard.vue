<template>
  <ConfirmationCard :data="data" @action="$emit('action')">
    <RoomImage/>
    <UserList :users="data.users"/>
  </ConfirmationCard>
</template>

<script>
import ConfirmationCard from '@/components/cards/ConfirmationCard.vue';
import UserList from '@/components/UserList.vue';
import RoomImage from '@/components/RoomImage.vue';

export default {
  components: {
    ConfirmationCard,
    UserList,
    RoomImage,
  },
  props: [
    'data',
  ],
  emits: [
    'action',
  ],
};
</script>
