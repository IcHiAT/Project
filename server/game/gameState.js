// UMD wrapper: works under Node require() (server) and as a browser global
// (window.SK.gameState) so the exact same game state machine runs online and
// offline.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./cards'), require('./rules'), require('./bot'));
  } else {
    root.SK = root.SK || {};
    root.SK.gameState = factory(root.SK.cards, root.SK.rules, root.SK.bot);
  }
}(typeof self !== 'undefined' ? self : this, function (cards, rules, bot) {
  'use strict';

  const { EDITIONS, buildDeck, shuffle, maxRoundsForPlayers } = cards;
  const { ledSuitFromPlays, legalMoves, resolveTrick, scoreRoundForPlayer } = rules;

  let seatCounter = 0;
function nextBotId() {
  seatCounter += 1;
  return `bot-${seatCounter}`;
}

class Game {
  constructor(roomCode, editionKey) {
    this.roomCode = roomCode;
    this.editionKey = EDITIONS[editionKey] ? editionKey : 'old';
    this.players = []; // { id, name, isBot, connected, hand, bid, tricksWon, bonusPoints, totalScore, ready }
    this.phase = 'lobby'; // lobby | bidding | playing | round-end | game-end
    this.round = 0;
    this.maxRounds = 0;
    this.startingPlayerIndex = 0;
    this.trickLeaderIndex = 0;
    this.turnIndex = 0;
    this.currentTrick = []; // { playerId, card, tigressChoice }
    this.lastTrick = null; // kept briefly for UI after resolution
    this.scoreHistory = []; // { round, entries: [{ playerId, bid, tricksWon, bonusPoints, roundScore }] }
    this.log = [];
  }

  get edition() {
    return EDITIONS[this.editionKey];
  }

  addLog(message) {
    this.log.push({ t: Date.now(), message });
    if (this.log.length > 200) this.log.shift();
  }

  findPlayer(playerId) {
    return this.players.find((p) => p.id === playerId);
  }

  addPlayer(id, name) {
    if (this.phase !== 'lobby') throw new Error('Spiel läuft bereits');
    if (this.players.length >= 8) throw new Error('Raum ist voll (max 8 Spieler)');
    this.players.push({
      id, name, isBot: false, connected: true,
      hand: [], bid: null, tricksWon: 0, bonusPoints: 0, totalScore: 0,
    });
  }

  addBot(name) {
    if (this.phase !== 'lobby') throw new Error('Spiel läuft bereits');
    if (this.players.length >= 8) throw new Error('Raum ist voll (max 8 Spieler)');
    const id = nextBotId();
    this.players.push({
      id, name: name || `Bot ${this.players.filter((p) => p.isBot).length + 1}`,
      isBot: true, connected: true,
      hand: [], bid: null, tricksWon: 0, bonusPoints: 0, totalScore: 0,
    });
    return id;
  }

  removePlayer(playerId) {
    if (this.phase === 'lobby') {
      this.players = this.players.filter((p) => p.id !== playerId);
      return;
    }
    const p = this.findPlayer(playerId);
    if (p) p.connected = false;
  }

  setEdition(editionKey) {
    if (this.phase !== 'lobby') throw new Error('Spiel läuft bereits');
    if (!EDITIONS[editionKey]) throw new Error('Unbekannte Edition');
    this.editionKey = editionKey;
  }

  startGame() {
    if (this.phase !== 'lobby') throw new Error('Spiel läuft bereits');
    if (this.players.length < 2) throw new Error('Mindestens 2 Spieler nötig');
    this.maxRounds = maxRoundsForPlayers(this.players.length);
    this.round = 0;
    this.scoreHistory = [];
    for (const p of this.players) p.totalScore = 0;
    this.startingPlayerIndex = 0;
    this.startNextRound();
  }

  startNextRound() {
    this.round += 1;
    if (this.round > this.maxRounds) {
      this.phase = 'game-end';
      return;
    }
    const deck = shuffle(buildDeck(this.editionKey));
    let cursor = 0;
    for (const p of this.players) {
      p.hand = deck.slice(cursor, cursor + this.round);
      cursor += this.round;
      p.bid = null;
      p.tricksWon = 0;
      p.bonusPoints = 0;
    }
    this.currentTrick = [];
    this.lastTrick = null;
    this.trickLeaderIndex = this.startingPlayerIndex;
    this.turnIndex = this.startingPlayerIndex;
    this.phase = 'bidding';
    this.addLog(`Runde ${this.round} beginnt (${this.round} Karte${this.round > 1 ? 'n' : ''} pro Spieler).`);
    this.runBotsIfNeeded();
  }

  currentPlayer() {
    return this.players[this.turnIndex];
  }

  placeBid(playerId, bid) {
    if (this.phase !== 'bidding') throw new Error('Gerade keine Ansage-Phase');
    const player = this.currentPlayer();
    if (!player || player.id !== playerId) throw new Error('Du bist nicht am Zug');
    if (!Number.isInteger(bid) || bid < 0 || bid > this.round) throw new Error('Ungültige Ansage');
    player.bid = bid;
    this.addLog(`${player.name} sagt ${bid} an.`);
    this.advanceBiddingTurn();
    this.runBotsIfNeeded();
  }

  advanceBiddingTurn() {
    const n = this.players.length;
    const allBid = this.players.every((p) => p.bid !== null);
    if (allBid) {
      this.phase = 'playing';
      this.turnIndex = this.trickLeaderIndex;
      return;
    }
    this.turnIndex = (this.turnIndex + 1) % n;
  }

  legalMovesFor(playerId) {
    const player = this.findPlayer(playerId);
    if (!player) return [];
    const ledSuit = ledSuitFromPlays(this.currentTrick);
    return legalMoves(player.hand, ledSuit).map((c) => c.id);
  }

  playCard(playerId, cardId, tigressChoice) {
    if (this.phase !== 'playing') throw new Error('Gerade keine Ausspiel-Phase');
    const player = this.currentPlayer();
    if (!player || player.id !== playerId) throw new Error('Du bist nicht am Zug');
    const cardIndex = player.hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) throw new Error('Karte nicht in der Hand');
    const card = player.hand[cardIndex];
    if (card.type === 'tigress' && tigressChoice !== 'pirate' && tigressChoice !== 'escape') {
      throw new Error('Tigress benötigt eine Wahl: pirate oder escape');
    }
    const ledSuit = ledSuitFromPlays(this.currentTrick);
    const allowed = legalMoves(player.hand, ledSuit);
    if (!allowed.some((c) => c.id === cardId)) throw new Error('Diese Karte darfst du gerade nicht spielen');

    player.hand.splice(cardIndex, 1);
    this.currentTrick.push({ playerId, card, tigressChoice: card.type === 'tigress' ? tigressChoice : undefined });
    this.addLog(`${player.name} spielt ${describeCard(card)}.`);

    const n = this.players.length;
    if (this.currentTrick.length === n) {
      this.resolveCurrentTrick();
    } else {
      this.turnIndex = (this.turnIndex + 1) % n;
    }
    this.runBotsIfNeeded();
  }

  resolveCurrentTrick() {
    const result = resolveTrick(this.currentTrick, this.edition);
    const winner = this.findPlayer(result.winnerPlayerId);
    winner.tricksWon += 1;
    winner.bonusPoints += result.bonusPoints;
    this.addLog(`${winner.name} gewinnt den Stich${result.bonusPoints ? ` (+${result.bonusPoints} Bonus)` : ''}.`);

    this.lastTrick = { plays: this.currentTrick, winnerPlayerId: result.winnerPlayerId, bonusPoints: result.bonusPoints };
    this.currentTrick = [];
    const winnerIndex = this.players.findIndex((p) => p.id === result.winnerPlayerId);
    this.trickLeaderIndex = winnerIndex;
    this.turnIndex = winnerIndex;

    const roundOver = this.players[0].hand.length === 0;
    if (roundOver) this.finishRound();
  }

  finishRound() {
    const entries = this.players.map((p) => {
      const roundScore = scoreRoundForPlayer({ bid: p.bid, tricksWon: p.tricksWon, bonusPoints: p.bonusPoints }, this.round);
      p.totalScore += roundScore;
      return {
        playerId: p.id, name: p.name, bid: p.bid, tricksWon: p.tricksWon,
        bonusPoints: p.bonusPoints, roundScore, totalScore: p.totalScore,
      };
    });
    this.scoreHistory.push({ round: this.round, entries });
    this.phase = 'round-end';
    this.startingPlayerIndex = (this.startingPlayerIndex + 1) % this.players.length;
  }

  continueAfterRound() {
    if (this.phase !== 'round-end' && this.phase !== 'game-end') return;
    if (this.phase === 'game-end') return;
    this.startNextRound();
  }

  runBotsIfNeeded() {
    let guard = 0;
    while (guard < 1000) {
      guard += 1;
      if (this.phase === 'bidding') {
        const player = this.currentPlayer();
        if (player && player.isBot) {
          const bid = bot.decideBid(player.hand, this.round, this.editionKey);
          this.placeBidInternal(player, bid);
          continue;
        }
      } else if (this.phase === 'playing') {
        const player = this.currentPlayer();
        if (player && player.isBot) {
          const ledSuit = ledSuitFromPlays(this.currentTrick);
          const decision = bot.decideCard(player, ledSuit, this.currentTrick, this.editionKey);
          this.playCardInternal(player, decision.cardId, decision.tigressChoice);
          continue;
        }
      } else if (this.phase === 'round-end') {
        // Auto-continue only if every human has left the room; otherwise
        // the server waits for a "continue" click from a connected human.
        const anyHumanConnected = this.players.some((p) => !p.isBot && p.connected);
        if (!anyHumanConnected) {
          this.startNextRound();
          continue;
        }
      }
      break;
    }
  }

  // Internal variants bypass the "is it your turn" ownership check that the
  // socket-facing methods enforce for human input, since bots always act on
  // their own turn from runBotsIfNeeded's loop.
  placeBidInternal(player, bid) {
    player.bid = bid;
    this.addLog(`${player.name} sagt ${bid} an.`);
    this.advanceBiddingTurn();
  }

  playCardInternal(player, cardId, tigressChoice) {
    const cardIndex = player.hand.findIndex((c) => c.id === cardId);
    const card = player.hand[cardIndex];
    player.hand.splice(cardIndex, 1);
    this.currentTrick.push({ playerId: player.id, card, tigressChoice: card.type === 'tigress' ? tigressChoice : undefined });
    this.addLog(`${player.name} spielt ${describeCard(card)}.`);
    const n = this.players.length;
    if (this.currentTrick.length === n) {
      this.resolveCurrentTrick();
    } else {
      this.turnIndex = (this.turnIndex + 1) % n;
    }
  }

  publicState() {
    return {
      roomCode: this.roomCode,
      editionKey: this.editionKey,
      phase: this.phase,
      round: this.round,
      maxRounds: this.maxRounds,
      turnPlayerId: this.players[this.turnIndex] ? this.players[this.turnIndex].id : null,
      trickLeaderId: this.players[this.trickLeaderIndex] ? this.players[this.trickLeaderIndex].id : null,
      currentTrick: this.currentTrick.map((p) => ({ playerId: p.playerId, card: p.card, tigressChoice: p.tigressChoice })),
      lastTrick: this.lastTrick,
      scoreHistory: this.scoreHistory,
      players: this.players.map((p) => ({
        id: p.id, name: p.name, isBot: p.isBot, connected: p.connected,
        handCount: p.hand.length, bid: p.bid, tricksWon: p.tricksWon,
        bonusPoints: p.bonusPoints, totalScore: p.totalScore,
      })),
      log: this.log.slice(-30),
    };
  }

  stateFor(playerId) {
    const state = this.publicState();
    const me = this.findPlayer(playerId);
    state.you = me ? { id: me.id, hand: me.hand, legalMoves: this.phase === 'playing' ? this.legalMovesFor(playerId) : [] } : null;
    return state;
  }
}

function describeCard(card) {
  if (card.type === 'number') return `${card.value} (${card.suit})`;
  if (card.type === 'pirate') return `Pirat${card.name ? ' ' + card.name : ''}`;
  if (card.type === 'mermaid') return 'Meerjungfrau';
  if (card.type === 'skullking') return 'Skull King';
  if (card.type === 'escape') return 'Flucht';
  if (card.type === 'tigress') return 'Tigress';
  return card.type;
}

  return { Game };
}));
