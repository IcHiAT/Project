'use strict';

const path = require('path');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const { Server } = require('socket.io');
const { Game } = require('./game/gameState');
const { EDITIONS } = require('./game/cards');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const CLIENT_DIR = path.join(__dirname, '..', 'client');

app.use(express.static(CLIENT_DIR));
// Serve the shared game engine so the browser can run the exact same rules
// offline (single-player vs bots) without duplicating the logic.
app.use('/engine', express.static(path.join(__dirname, 'game')));
app.get('/r/:code', (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

/** @type {Map<string, Game>} */
const rooms = new Map();
/** roomCode -> Map<playerId, socketId> */
const socketsByRoom = new Map();
/** socket.id -> { roomCode, playerId } */
const socketMeta = new Map();

function genRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  let code;
  do {
    code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function genPlayerId() {
  return crypto.randomBytes(12).toString('hex');
}

function broadcast(roomCode) {
  const game = rooms.get(roomCode);
  const sockets = socketsByRoom.get(roomCode);
  if (!game || !sockets) return;
  for (const player of game.players) {
    if (player.isBot) continue;
    const socketId = sockets.get(player.id);
    if (!socketId) continue;
    const s = io.sockets.sockets.get(socketId);
    if (s) s.emit('state', game.stateFor(player.id));
  }
}

function requireGame(roomCode) {
  const game = rooms.get(roomCode);
  if (!game) throw new Error('Raum nicht gefunden');
  return game;
}

function isHost(game, playerId) {
  const humans = game.players.filter((p) => !p.isBot);
  return humans.length > 0 && humans[0].id === playerId;
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ name, editionKey }, cb) => {
    try {
      const roomCode = genRoomCode();
      const game = new Game(roomCode, editionKey || 'old');
      const playerId = genPlayerId();
      game.addPlayer(playerId, (name || 'Spieler').slice(0, 20));
      rooms.set(roomCode, game);
      socketsByRoom.set(roomCode, new Map([[playerId, socket.id]]));
      socketMeta.set(socket.id, { roomCode, playerId });
      socket.join(roomCode);
      cb({ ok: true, roomCode, playerId });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('join-room', ({ roomCode, name, playerId }, cb) => {
    try {
      const code = (roomCode || '').toUpperCase().trim();
      const game = requireGame(code);
      let finalPlayerId = playerId;
      const existing = playerId && game.findPlayer(playerId);
      if (existing) {
        existing.connected = true;
      } else {
        if (game.phase !== 'lobby') throw new Error('Spiel läuft bereits - Beitritt nicht mehr möglich');
        finalPlayerId = genPlayerId();
        game.addPlayer(finalPlayerId, (name || 'Spieler').slice(0, 20));
      }
      if (!socketsByRoom.has(code)) socketsByRoom.set(code, new Map());
      socketsByRoom.get(code).set(finalPlayerId, socket.id);
      socketMeta.set(socket.id, { roomCode: code, playerId: finalPlayerId });
      socket.join(code);
      cb({ ok: true, roomCode: code, playerId: finalPlayerId });
      broadcast(code);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('add-bot', ({ roomCode, playerId }, cb) => {
    try {
      const game = requireGame(roomCode);
      if (!isHost(game, playerId)) throw new Error('Nur der Host kann Bots hinzufügen');
      game.addBot();
      cb({ ok: true });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('remove-player', ({ roomCode, playerId, targetId }, cb) => {
    try {
      const game = requireGame(roomCode);
      if (!isHost(game, playerId) && playerId !== targetId) throw new Error('Nur der Host kann andere entfernen');
      game.removePlayer(targetId);
      cb({ ok: true });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('set-edition', ({ roomCode, playerId, editionKey }, cb) => {
    try {
      const game = requireGame(roomCode);
      if (!isHost(game, playerId)) throw new Error('Nur der Host kann die Version ändern');
      game.setEdition(editionKey);
      cb({ ok: true });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('start-game', ({ roomCode, playerId }, cb) => {
    try {
      const game = requireGame(roomCode);
      if (!isHost(game, playerId)) throw new Error('Nur der Host kann das Spiel starten');
      game.startGame();
      cb({ ok: true });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('place-bid', ({ roomCode, playerId, bid }, cb) => {
    try {
      const game = requireGame(roomCode);
      game.placeBid(playerId, bid);
      cb({ ok: true });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('play-card', ({ roomCode, playerId, cardId, tigressChoice }, cb) => {
    try {
      const game = requireGame(roomCode);
      game.playCard(playerId, cardId, tigressChoice);
      cb({ ok: true });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('continue-round', ({ roomCode, playerId }, cb) => {
    try {
      const game = requireGame(roomCode);
      game.continueAfterRound();
      game.runBotsIfNeeded();
      cb({ ok: true });
      broadcast(roomCode);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('disconnect', () => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    socketMeta.delete(socket.id);
    const { roomCode, playerId } = meta;
    const game = rooms.get(roomCode);
    const sockets = socketsByRoom.get(roomCode);
    if (sockets) sockets.delete(playerId);
    if (game) {
      game.removePlayer(playerId);
      broadcast(roomCode);
      const anyHumanLeft = game.players.some((p) => !p.isBot);
      const anyConnected = game.players.some((p) => !p.isBot && p.connected);
      if (!anyHumanLeft || (game.phase === 'lobby' && !anyConnected)) {
        rooms.delete(roomCode);
        socketsByRoom.delete(roomCode);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Skull King server läuft auf Port ${PORT}`);
  console.log(`Editionen: ${Object.values(EDITIONS).map((e) => e.key).join(', ')}`);
});
