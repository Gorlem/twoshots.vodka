<template>
  <div class="hero-body">
    <div class="container">
      <h1 class="title">{{ data.question }}</h1>
      <div v-if="data.answer == null">
        <h2 class="subtitle">
          Der Gewinner darf 3 Schlücke verteilen, der Verlierer muss 3 Schlücke trinken.
          Falls mehrere die richtige Antwort gegeben haben, geht es um Geschwindigkeit.
        </h2>
        <div class="field has-addons">
          <p class="control">
            <input class="input" type="number" v-model.number="guess" ref="input"/>
          </p>
          <p class="control" v-if="data.unit != null">
            <span class="button is-static" type="button">
              {{ data.unit }}
            </span>
          </p>
        </div>

        <VoteButton namespace="card:guess" :data="guess">Bestätigen</VoteButton>
      </div>
      <div v-else>
        <h2 class="subtitle">
          Die richtige Antwort ist {{ data.answer.toLocaleString() }}.
          Somit darf {{ data.winner }} 3 Schlücke verteilen, und {{ data.loser }} muss 3 Schlücke trinken.
        </h2>
        Quelle: <a :href="data.source" target="_blank">{{ sourceDomain }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import VoteButton from '@/components/VoteButton.vue';

export default {
  data() {
    return {
      guess: '',
    };
  },
  components: {
    VoteButton,
  },
  mounted() {
    this.$refs.input.focus();
  },
  computed: {
    ...mapState({
      data: (state) => state.card.data,
    }),
    sourceDomain() {
      return new URL(this.data.source).hostname;
    },
  },
};
</script>
