<template>
  <component :is="view" @navigate="navigate" @update="update"/>
</template>

<style>
body {
  touch-action: none;
}

html, body, #app {
  height: 100%;
}

.hero.is-fullheight {
  min-height: 100% !important;
}
</style>

<script>
import StartPage from '@/pages/StartPage.vue';
import RoomPage from '@/pages/RoomPage.vue';

const routes = {
  '/': StartPage,
  '/new': RoomPage,
  default: RoomPage,
};

export default {
  data() {
    return {
      path: window.location.pathname,
    };
  },
  computed: {
    view() {
      return routes[this.path] || routes.default;
    },
  },
  mounted() {
    window.addEventListener('popstate', () => {
      this.path = window.location.pathname;
    });
  },
  methods: {
    navigate(path) {
      window.history.pushState({}, '', path);
      this.path = path;
    },
    update(path) {
      window.history.replaceState({}, '', path);
      this.path = path;
    },
  },
};
</script>
