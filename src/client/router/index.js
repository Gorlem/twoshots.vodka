import { createRouter, createWebHistory } from 'vue-router';
import RoomSelection from '@/views/RoomSelection.vue';
import Room from '@/views/Room.vue';

import socket from '@/socket';

const routes = [
  {
    path: '/',
    name: 'RoomSelection',
    component: RoomSelection,
  },
  {
    path: '/:roomId',
    name: 'Room',
    component: Room,
    beforeEnter(to) {
      return new Promise((resolve) => {
        socket.emit('has-room', to.params.roomId, (result) => {
          resolve(result ? true : { name: 'RoomSelection' });
        });
      });
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
