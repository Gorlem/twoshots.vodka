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
            <input class="input" type="text" list="drinks" v-model="left" ref="input"/>
          </p>
          <p class="control">
            <span class="button is-static">{{ data.divider }}</span>
          </p>
          <p class="control">
            <input class="input" type="text" list="drinks" v-model="right"/>
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
    };
  },
  mounted() {
    this.$refs.input.focus();
  },
};
</script>
