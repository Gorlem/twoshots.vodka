<template>
    <h1 class="title">Raum {{ roomId }}</h1>
    <h2 class="subtitle">
      Mitspieler können den QR-Code scannen oder die Raumnummer auf der Startseite eingeben.
    </h2>
    <div class="box is-inline-block">
      <div class="image is-128x128">
        <img :src="qrCode" alt="QR-Code for joining the room"/>
      </div>
    </div>
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
  watch: {
    async roomId() {
      console.log(this.roomId);
      console.log(window.location.href);
      this.qrCode = await QRCode.toDataURL(window.location.href, { margin: 0 });
    },
  },
};
</script>
