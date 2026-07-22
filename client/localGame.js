'use strict';

// Offline / single-player transport.
//
// It exposes the same surface the app uses on the real Socket.IO socket -
// `.emit(event, payload, callback)`, `.on('state', handler)` and a
// `.connected` flag - but instead of going over the network it drives one
// in-browser Game instance (the exact same engine the server runs) and pushes
// state straight back to the app. This lets the whole existing UI work
// unchanged with zero network, so solo games against bots run fully offline.
class LocalTransport {
  constructor() {
    this.connected = true; // "always connected" - it's all in-memory
    this.game = null;
    this.myId = 'me';
    this._handlers = {};
    const { Game } = window.SK.gameState;
    this._GameClass = Game;
  }

  on(event, handler) {
    this._handlers[event] = handler;
  }

  _pushState() {
    if (this.game && this._handlers.state) {
      this._handlers.state(this.game.stateFor(this.myId));
    }
  }

  // Mirrors the server's socket event handlers, but against a single local
  // Game with no rooms and a single human seat.
  emit(event, payload, cb) {
    const done = typeof cb === 'function' ? cb : () => {};
    try {
      switch (event) {
        case 'create-room': {
          this.game = new this._GameClass('SOLO', payload.editionKey || 'old');
          this.game.addPlayer(this.myId, (payload.name || 'Ich').slice(0, 20));
          done({ ok: true, roomCode: 'SOLO', playerId: this.myId });
          this._pushState();
          return;
        }
        case 'add-bot': {
          this.game.addBot();
          done({ ok: true });
          this._pushState();
          return;
        }
        case 'remove-player': {
          this.game.removePlayer(payload.targetId);
          done({ ok: true });
          this._pushState();
          return;
        }
        case 'set-edition': {
          this.game.setEdition(payload.editionKey);
          done({ ok: true });
          this._pushState();
          return;
        }
        case 'start-game': {
          this.game.startGame();
          done({ ok: true });
          this._pushState();
          return;
        }
        case 'place-bid': {
          this.game.placeBid(this.myId, payload.bid);
          done({ ok: true });
          this._pushState();
          return;
        }
        case 'play-card': {
          this.game.playCard(this.myId, payload.cardId, payload.tigressChoice);
          done({ ok: true });
          this._pushState();
          return;
        }
        case 'continue-round': {
          this.game.continueAfterRound();
          this.game.runBotsIfNeeded();
          done({ ok: true });
          this._pushState();
          return;
        }
        case 'join-room': {
          // Not meaningful offline - there is nothing to join.
          done({ ok: false, error: 'Offline-Modus: Beitreten nicht möglich' });
          return;
        }
        default:
          done({ ok: false, error: `Unbekanntes Ereignis: ${event}` });
      }
    } catch (err) {
      done({ ok: false, error: err.message });
    }
  }
}

window.LocalTransport = LocalTransport;
