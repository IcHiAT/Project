// UMD wrapper: works under Node require() (server) and as a browser global
// (window.SK.rules).
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./cards'));
  } else {
    root.SK = root.SK || {};
    root.SK.rules = factory(root.SK.cards);
  }
}(typeof self !== 'undefined' ? self : this, function (cards) {
  'use strict';

  const { TRUMP_SUIT } = cards;

  const SPECIAL_TYPES = new Set(['escape', 'pirate', 'mermaid', 'skullking', 'tigress']);

  function isSpecial(card) {
    return SPECIAL_TYPES.has(card.type);
  }

  // The suit that must be followed is set by the first non-special (i.e.
  // colored or trump/black number) card played in the trick. Special cards
  // never establish or count toward a led suit.
  function ledSuitFromPlays(plays) {
    for (const play of plays) {
      if (!isSpecial(play.card)) return play.card.suit;
    }
    return null;
  }

  function legalMoves(hand, ledSuit) {
    if (!ledSuit) return hand.slice();
    const hasLedSuit = hand.some((c) => c.suit === ledSuit);
    if (!hasLedSuit) return hand.slice();
    return hand.filter((c) => c.suit === ledSuit || c.suit === TRUMP_SUIT || isSpecial(c));
  }

  // plays: ordered array of { playerId, card, tigressChoice } for one trick.
  // tigressChoice ('pirate' | 'escape') is required when card.type === 'tigress'.
  // Returns { winnerIndex, winnerPlayerId, category, bonusPoints }
  function resolveTrick(plays, edition) {
    const effective = plays.map((p) => {
      if (p.card.type === 'tigress') {
        return p.tigressChoice === 'pirate' ? 'pirate' : 'escape';
      }
      return p.card.type;
    });

    const ledSuit = ledSuitFromPlays(plays);

    const indicesOf = (type) => effective
      .map((t, i) => (t === type ? i : -1))
      .filter((i) => i !== -1);

    let winnerIndex = null;
    let category = null;

    const mermaids = indicesOf('mermaid');
    const skullkings = indicesOf('skullking');
    const pirates = indicesOf('pirate');

    if (mermaids.length > 0 && skullkings.length > 0) {
      winnerIndex = mermaids[0];
      category = 'mermaid';
    } else if (skullkings.length > 0) {
      winnerIndex = skullkings[0];
      category = 'skullking';
    } else if (pirates.length > 0) {
      winnerIndex = pirates[0];
      category = 'pirate';
    } else {
      const trumps = plays
        .map((p, i) => ({ i, card: p.card }))
        .filter(({ card }) => !isSpecial(card) && card.suit === TRUMP_SUIT);
      if (trumps.length > 0) {
        trumps.sort((a, b) => b.card.value - a.card.value);
        winnerIndex = trumps[0].i;
        category = 'trump';
      } else if (ledSuit) {
        const ledCards = plays
          .map((p, i) => ({ i, card: p.card }))
          .filter(({ card }) => !isSpecial(card) && card.suit === ledSuit);
        if (ledCards.length > 0) {
          ledCards.sort((a, b) => b.card.value - a.card.value);
          winnerIndex = ledCards[0].i;
          category = 'suit';
        }
      }
    }

    // Nobody played a colored/trump/pirate/mermaid/SK card (e.g. an all-Escape
    // trick) - the first card played wins by convention.
    if (winnerIndex === null) {
      winnerIndex = 0;
      category = 'escape';
    }

    let bonusPoints = 0;
    if (edition.fourteenBonus) {
      for (const { card } of plays) {
        if (card.type === 'number' && card.value === 14) {
          bonusPoints += card.suit === TRUMP_SUIT ? 20 : 10;
        }
      }
    }
    if (skullkings.length > 0) {
      if (category === 'pirate') bonusPoints += 30;
      if (category === 'mermaid') bonusPoints += 50;
    }

    return {
      winnerIndex,
      winnerPlayerId: plays[winnerIndex].playerId,
      category,
      bonusPoints,
    };
  }

  // player: { bid, tricksWon, bonusPoints }
  function scoreRoundForPlayer(player, roundNumber) {
    const { bid, tricksWon, bonusPoints } = player;
    if (bid === tricksWon) {
      const base = bid === 0 ? 10 * roundNumber : 20 * bid;
      return base + bonusPoints;
    }
    return -10 * Math.abs(bid - tricksWon);
  }

  return {
    isSpecial,
    ledSuitFromPlays,
    legalMoves,
    resolveTrick,
    scoreRoundForPlayer,
  };
}));
