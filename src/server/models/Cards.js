import _ from 'lodash';

export default class Cards {
    static ranks = ['🅰️', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '💂', '👸', '🤴'];
    static suites = {
      '♣️': 'clubs',
      '♦️': 'diamonds',
      '♥️': 'hearts',
      '♠️': 'spades',
    };

    static deck = Cards.ranks.flatMap((face) => Object.keys(Cards.suites).map((suite) => suite + face));

    static sample(amount) {
      return _.sampleSize(Cards.deck, amount);
    }

    static getSuite(card) {
      const suite = card.slice(0, 2);
      return Cards.suites[suite];
    }

    static getRank(card) {
      const rank = card.slice(2);
      return Cards.ranks.indexOf(rank);
    }
}
