<template>
    <h1>{{ roomId }}</h1>
    <img :src="qrCode" alt="QR-Code for joining the room"/>
</template>

<script>
import QRCode from 'qrcode';

export default {
  props: {
    roomId: String,
  },
  data() {
    return {
      qrCode: '',
    };
  },
  async created() {
    this.qrCode = await QRCode.toDataURL(window.location.href);
  },
};
</script>
