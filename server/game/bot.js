'use strict';

const { EDITIONS, TRUMP_SUIT } = require('./cards');
const { legalMoves } = require('./rules');

// Rough "strength" weight per card, used only for bid estimation (expected
// number of tricks a hand is likely to win) - not exact trick simulation.
function cardStrength(card, edition) {
  switch (card.type) {
    case 'skullking': return 0.92;
    case 'pirate': return 0.72;
    case 'tigress': return 0.65;
    case 'mermaid': return 0.45;
    case 'escape': return 0;
    case 'number': {
      const frac = card.value / edition.suitMax;
      if (card.suit === TRUMP_SUIT) return 0.35 + frac * 0.5;
      return frac * 0.35;
    }
    default: return 0.1;
  }
}

function decideBid(hand, roundNumber, editionKey) {
  const edition = EDITIONS[editionKey] || EDITIONS.old;
  let expected = 0;
  for (const card of hand) expected += cardStrength(card, edition);
  let bid = Math.round(expected);
  if (bid < 0) bid = 0;
  if (bid > roundNumber) bid = roundNumber;
  return bid;
}

// Heuristic "power" used only to rank cards relative to each other when
// deciding what to play - not the authoritative trick-resolution logic
// (that lives in rules.js and is what actually decides the winner).
function cardPower(card, edition, ledSuit) {
  switch (card.type) {
    case 'skullking': return 1000;
    case 'pirate': return 900;
    case 'mermaid': return 800;
    case 'tigress': return 850;
    case 'escape': return -10;
    case 'number': {
      if (card.suit === TRUMP_SUIT) return 500 + card.value;
      if (ledSuit && card.suit === ledSuit) return 100 + card.value;
      return 50 + card.value;
    }
    default: return 0;
  }
}

function decideCard(player, ledSuit, currentTrick, editionKey) {
  const edition = EDITIONS[editionKey] || EDITIONS.old;
  const legal = legalMoves(player.hand, ledSuit);
  const wantsToWin = player.tricksWon < player.bid;

  const ranked = legal
    .map((card) => ({ card, power: cardPower(card, edition, ledSuit) }))
    .sort((a, b) => (wantsToWin ? b.power - a.power : a.power - b.power));

  const chosen = ranked[0].card;
  let tigressChoice;
  if (chosen.type === 'tigress') {
    tigressChoice = wantsToWin ? 'pirate' : 'escape';
  }
  return { cardId: chosen.id, tigressChoice };
}

module.exports = { decideBid, decideCard };
