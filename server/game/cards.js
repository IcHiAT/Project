// UMD wrapper: works under Node require() (server) and as a browser global
// (window.SK.cards) so the exact same rules engine runs online and offline.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SK = root.SK || {};
    root.SK.cards = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Two supported rule editions. Both decks total 66 cards, matching the
  // well-documented round counts (10 rounds for up to 6 players, 9 for 7,
  // 8 for 8 players).
  const EDITIONS = {
    old: {
      key: 'old',
      label: 'Alte Version (Klassisch)',
      suitMax: 14,
      escapeCount: 2,
      pirateCount: 5,
      mermaidCount: 2,
      hasTigress: false,
      fourteenBonus: true,
    },
    new: {
      key: 'new',
      label: 'Neue Version (Tigress)',
      suitMax: 13,
      escapeCount: 5,
      pirateCount: 5,
      mermaidCount: 2,
      hasTigress: true,
      fourteenBonus: false,
    },
  };

  const SUITS = ['green', 'purple', 'yellow', 'black']; // black = Jolly Roger, always trump
  const TRUMP_SUIT = 'black';

  const PIRATE_NAMES = [
    'Rosie D’Laney',
    'Bendt the Bold',
    'Juanita Jade',
    'Harry the Giant',
    'Eric the Ugly',
  ];

  let idCounter = 0;
  function nextId() {
    idCounter += 1;
    return `c${idCounter}`;
  }

  function buildDeck(editionKey) {
    const edition = EDITIONS[editionKey] || EDITIONS.old;
    const deck = [];

    for (const suit of SUITS) {
      for (let value = 1; value <= edition.suitMax; value += 1) {
        deck.push({ id: nextId(), type: 'number', suit, value });
      }
    }

    for (let i = 0; i < edition.escapeCount; i += 1) {
      deck.push({ id: nextId(), type: 'escape', suit: null, value: null });
    }

    for (let i = 0; i < edition.pirateCount; i += 1) {
      deck.push({ id: nextId(), type: 'pirate', suit: null, value: null, name: PIRATE_NAMES[i % PIRATE_NAMES.length] });
    }

    for (let i = 0; i < edition.mermaidCount; i += 1) {
      deck.push({ id: nextId(), type: 'mermaid', suit: null, value: null });
    }

    if (edition.hasTigress) {
      deck.push({ id: nextId(), type: 'tigress', suit: null, value: null });
    }

    deck.push({ id: nextId(), type: 'skullking', suit: null, value: null });

    return deck;
  }

  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function maxRoundsForPlayers(playerCount) {
    if (playerCount >= 8) return 8;
    if (playerCount === 7) return 9;
    return 10;
  }

  return {
    EDITIONS,
    SUITS,
    TRUMP_SUIT,
    buildDeck,
    shuffle,
    maxRoundsForPlayers,
  };
}));
