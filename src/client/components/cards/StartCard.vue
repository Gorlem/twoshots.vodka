<template>
  <InformationCard :data="data">
    <div class="columns">
      <div class="column">
        <button @click="$emit('action')" class="button is-primary">{{ data.buttons.create }}</button>
      </div>
      <div class="column">
        <datalist id="drinks">
          <option :value="name" v-for="name in data.names" :key="name"/>
        </datalist>
        <div class="field has-addons">
          <p class="control">
            <input class="input" type="text" list="drinks" :placeholder="placeholderLeft"
              v-model="left" @keydown.enter="$refs.right.focus()" ref="left"/>
          </p>
          <p class="control">
            <span class="button is-static">{{ data.divider }}</span>
          </p>
          <p class="control">
            <input class="input" type="text" list="drinks" :placeholder="placeholderRight"
              v-model="right" @keydown.enter="$emit('action', left, right)" ref="right"/>
          </p>
        </div>
        <p class="control">
          <button class="button is-primary" @click="$emit('action', left, right)">{{ data.buttons.join }}</button>
        </p>
      </div>
    </div>
  </InformationCard>
</template>

<script>
import InformationCard from '@/components/cards/InformationCard.vue';

export default {
  components: {
    InformationCard,
  },
  props: [
    'data',
  ],
  emits: [
    'action',
  ],
  data() {
    return {
      left: '',
      right: '',
      placeholderLeft: '',
      placeholderRight: '',
      timer: '',
    };
  },
  mounted() {
    this.$refs.left.focus();

    this.placeholderLeft = this.randomPart();
    this.placeholderRight = this.randomPart();

    this.timer = setInterval(this.updatePlaceholder, 5000);
  },
  methods: {
    randomPart() {
      const number = Math.floor(Math.random() * this.data.names.length);
      return this.data.names[number];
    },
    updatePlaceholder() {
      if (Math.random() > 0.5) {
        this.placeholderLeft = this.randomPart();
      } else {
        this.placeholderRight = this.randomPart();
      }
    },
  },
};
</script>
