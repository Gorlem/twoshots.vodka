<template>
    <div class="box is-inline-block">
      <div class="image is-128x128">
        <img :src="qrCode" alt="QR-Code for joining the room"/>
      </div>
    </div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  data() {
    return {
      qrCode: '',
    };
  },
  async mounted() {
    this.qrCode = await QRCode.toDataURL(window.location.href, { margin: 0 });
  },
};
</script>
