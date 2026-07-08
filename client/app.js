'use strict';

// Socket.IO connection
const socket = io();

// State
let gameState = null;
let myId = null;
let roomCode = null;
let selectedTigressCard = null;

const SUIT_LABELS = {
  green: '♣',
  purple: '♠',
  yellow: '♥',
  black: '♣', // Skull/Jolly Roger
};

const SUIT_COLORS = {
  green: 'green',
  purple: 'purple',
  yellow: 'yellow',
  black: 'black',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  checkAndRejoin();
  updateConnectionStatus();
});

// Socket.IO events
socket.on('connect', () => {
  updateConnectionStatus();
});

socket.on('disconnect', () => {
  updateConnectionStatus();
});

socket.on('state', (state) => {
  gameState = state;
  render();
});

// UI Events
function initEventListeners() {
  // Start screen tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab);
    });
  });

  // Create room
  document.getElementById('btn-create-room').addEventListener('click', createRoom);

  // Join room
  document.getElementById('btn-join-room').addEventListener('click', joinRoom);

  // Lobby controls
  document.getElementById('btn-add-bot').addEventListener('click', addBot);
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('btn-leave-lobby').addEventListener('click', leaveLobby);
  document.getElementById('btn-copy-link').addEventListener('click', copyShareLink);

  // Edition selector
  document.getElementById('edition-select').addEventListener('change', (e) => {
    if (!gameState) return;
    socket.emit('set-edition', {
      roomCode: gameState.roomCode,
      playerId: myId,
      editionKey: e.target.value,
    }, (response) => {
      if (!response.ok) showError(response.error, 'lobby');
    });
  });

  // Game phase buttons
  document.getElementById('btn-confirm-bid').addEventListener('click', confirmBid);
  document.getElementById('btn-continue-round').addEventListener('click', () => {
    if (!gameState) return;
    socket.emit('continue-round', {
      roomCode: gameState.roomCode,
      playerId: myId,
    }, (response) => {
      if (!response.ok) showError(response.error, 'game');
    });
  });
  document.getElementById('btn-new-game').addEventListener('click', () => {
    location.pathname = '/';
  });

  // Tigress modal
  document.querySelectorAll('.tigress-buttons button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const choice = e.target.dataset.choice;
      if (selectedTigressCard) {
        playCard(selectedTigressCard, choice);
        selectedTigressCard = null;
        document.getElementById('tigress-modal').style.display = 'none';
      }
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

function createRoom() {
  const name = document.getElementById('create-name').value.trim();
  if (!name) {
    showError('Bitte gib einen Namen ein', 'start');
    return;
  }

  const editionKey = document.querySelector('input[name="edition"]:checked').value;

  socket.emit('create-room', { name, editionKey }, (response) => {
    if (response.ok) {
      myId = response.playerId;
      roomCode = response.roomCode;
      saveSession();
      showScreen('lobby');
    } else {
      showError(response.error, 'start');
    }
  });
}

function joinRoom() {
  const name = document.getElementById('join-name').value.trim();
  const code = document.getElementById('join-code').value.trim().toUpperCase();

  if (!name) {
    showError('Bitte gib einen Namen ein', 'start');
    return;
  }
  if (!code) {
    showError('Bitte gib einen Raum-Code ein', 'start');
    return;
  }

  socket.emit('join-room', { roomCode: code, name, playerId: undefined }, (response) => {
    if (response.ok) {
      myId = response.playerId;
      roomCode = response.roomCode;
      saveSession();
      showScreen('lobby');
    } else {
      showError(response.error, 'start');
    }
  });
}

function addBot() {
  if (!gameState) return;
  socket.emit('add-bot', {
    roomCode: gameState.roomCode,
    playerId: myId,
  }, (response) => {
    if (!response.ok) showError(response.error, 'lobby');
  });
}

function startGame() {
  if (!gameState) return;
  socket.emit('start-game', {
    roomCode: gameState.roomCode,
    playerId: myId,
  }, (response) => {
    if (!response.ok) showError(response.error, 'lobby');
  });
}

function leaveLobby() {
  if (!gameState) return;
  socket.emit('remove-player', {
    roomCode: gameState.roomCode,
    playerId: myId,
    targetId: myId,
  }, (response) => {
    if (!response.ok) showError(response.error, 'lobby');
    else {
      clearSession();
      location.pathname = '/';
    }
  });
}

function copyShareLink() {
  const link = document.getElementById('share-link').value;
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('btn-copy-link');
    const original = btn.textContent;
    btn.textContent = '✓ Kopiert!';
    setTimeout(() => btn.textContent = original, 2000);
  });
}

function confirmBid() {
  const bidInput = document.getElementById('bid-input');
  const bid = parseInt(bidInput.value, 10);

  if (!Number.isInteger(bid) || bid < 0 || bid > gameState.round) {
    showError(`Ungültige Ansage (0-${gameState.round})`, 'game');
    return;
  }

  socket.emit('place-bid', {
    roomCode: gameState.roomCode,
    playerId: myId,
    bid,
  }, (response) => {
    if (!response.ok) showError(response.error, 'game');
  });
}

function playCard(cardId, tigressChoice) {
  socket.emit('play-card', {
    roomCode: gameState.roomCode,
    playerId: myId,
    cardId,
    tigressChoice,
  }, (response) => {
    if (!response.ok) showError(response.error, 'game');
  });
}

// Persistence
function saveSession() {
  if (myId && roomCode) {
    localStorage.setItem('skullking_session', JSON.stringify({ roomCode, playerId: myId }));
  }
}

function clearSession() {
  localStorage.removeItem('skullking_session');
}

function checkAndRejoin() {
  // Check URL path for /r/XXXX
  const pathMatch = window.location.pathname.match(/^\/r\/([A-Z0-9]{4})$/i);
  if (pathMatch) {
    const code = pathMatch[1].toUpperCase();
    document.getElementById('join-code').value = code;
    switchTab('join');
  }

  // Try to rejoin from localStorage
  const session = localStorage.getItem('skullking_session');
  if (session) {
    try {
      const { roomCode: savedCode, playerId: savedId } = JSON.parse(session);
      roomCode = savedCode;
      myId = savedId;

      socket.emit('join-room', {
        roomCode: savedCode,
        name: 'Player',
        playerId: savedId,
      }, (response) => {
        if (response.ok) {
          myId = response.playerId;
          roomCode = response.roomCode;
          saveSession();
        } else {
          clearSession();
        }
      });
    } catch (e) {
      clearSession();
    }
  }
}

// Rendering
function render() {
  if (!gameState) return;

  if (gameState.phase === 'lobby') {
    showScreen('lobby');
    renderLobby();
  } else {
    showScreen('game');
    renderGame();
  }
}

function renderLobby() {
  document.getElementById('room-code-display').textContent = gameState.roomCode;
  document.getElementById('share-link').value = `${location.origin}/r/${gameState.roomCode}`;

  // Edition selector
  document.getElementById('edition-select').value = gameState.editionKey;

  // Players list
  const playersList = document.getElementById('players-list');
  playersList.innerHTML = '';
  gameState.players.forEach(player => {
    const item = document.createElement('div');
    item.className = 'player-item';

    const leftDiv = document.createElement('div');
    leftDiv.style.flex = '1';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-name';
    nameSpan.textContent = player.name;
    leftDiv.appendChild(nameSpan);

    if (player.isBot) {
      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'player-badge';
      badgeSpan.textContent = '🤖 Bot';
      leftDiv.appendChild(badgeSpan);
    }

    const statusSpan = document.createElement('span');
    statusSpan.className = `player-status ${player.connected ? '' : 'disconnected'}`;
    statusSpan.textContent = player.connected ? '✓' : '✗';

    item.appendChild(leftDiv);
    item.appendChild(statusSpan);

    // Remove button
    if (player.id === myId || isHostPlayer(gameState)) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-small';
      removeBtn.textContent = player.id === myId ? 'Verlassen' : 'Entfernen';
      removeBtn.style.marginLeft = '10px';
      removeBtn.addEventListener('click', () => {
        socket.emit('remove-player', {
          roomCode: gameState.roomCode,
          playerId: myId,
          targetId: player.id,
        }, (response) => {
          if (!response.ok) showError(response.error, 'lobby');
        });
      });
      item.appendChild(removeBtn);
    }

    playersList.appendChild(item);
  });
}

function renderGame() {
  // Update phase info
  const phaseLabels = {
    bidding: 'Ansage-Phase',
    playing: 'Ausspiel-Phase',
    'round-end': 'Runde vorbei',
    'game-end': 'Spiel vorbei',
  };
  document.getElementById('phase-info').textContent = phaseLabels[gameState.phase] || '';

  // Update round numbers
  document.getElementById('round-number').textContent = Math.min(gameState.round, gameState.maxRounds);
  document.getElementById('max-rounds').textContent = gameState.maxRounds;

  // Render log
  renderLog();

  // Render players info
  renderPlayersInfo();

  // Render scoreboard
  renderScoreboard();

  // Render trick
  renderTrick();

  // Render hand
  renderHand();

  // Render phase-specific UI. Reset every shared section first so a phase
  // transition can never leave a previous phase's panel (e.g. the
  // round-end overlay) visible on top of the new one.
  document.getElementById('bidding-section').style.display = 'none';
  document.getElementById('hand-section').style.display = 'flex';
  document.getElementById('round-end-section').style.display = 'none';
  document.getElementById('game-end-section').style.display = 'none';

  if (gameState.phase === 'bidding') {
    renderBiddingPhase();
  } else if (gameState.phase === 'playing') {
    // sections already reset above
  } else if (gameState.phase === 'round-end') {
    document.getElementById('hand-section').style.display = 'none';
    renderRoundEnd();
  } else if (gameState.phase === 'game-end') {
    document.getElementById('hand-section').style.display = 'none';
    renderGameEnd();
  }
}

function renderLog() {
  const logDiv = document.getElementById('game-log');
  logDiv.innerHTML = '';

  const recentCount = 3;
  gameState.log.forEach((entry, idx) => {
    const isRecent = idx >= gameState.log.length - recentCount;
    const div = document.createElement('div');
    div.className = `log-entry ${isRecent ? 'recent' : ''}`;
    div.textContent = entry.message;
    logDiv.appendChild(div);
  });

  logDiv.scrollTop = logDiv.scrollHeight;
}

function renderPlayersInfo() {
  const playersInfo = document.getElementById('players-info');
  playersInfo.innerHTML = '';

  gameState.players.forEach(player => {
    const item = document.createElement('div');
    item.className = 'player-info-item';
    if (gameState.turnPlayerId === player.id) {
      item.classList.add('player-info-turn');
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-info-name';
    nameSpan.textContent = player.name;

    const statsSpan = document.createElement('span');
    statsSpan.className = 'player-info-stats';
    statsSpan.textContent = `${player.totalScore} Pkt`;

    item.appendChild(nameSpan);
    item.appendChild(statsSpan);

    playersInfo.appendChild(item);
  });
}

function renderScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = '';

  if (gameState.scoreHistory.length === 0) {
    scoreboard.innerHTML = '<p>Keine Ergebnisse noch</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'scoreboard-table';

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const th1 = document.createElement('th');
  th1.textContent = 'Rd';
  headerRow.appendChild(th1);
  gameState.players.forEach(p => {
    const th = document.createElement('th');
    th.textContent = p.name.substring(0, 5);
    th.title = p.name;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  gameState.scoreHistory.forEach(record => {
    const row = document.createElement('tr');
    const tdRound = document.createElement('td');
    tdRound.textContent = record.round;
    row.appendChild(tdRound);

    gameState.players.forEach(p => {
      const entry = record.entries.find(e => e.playerId === p.id);
      const td = document.createElement('td');
      td.textContent = entry ? entry.totalScore : '-';
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  scoreboard.appendChild(table);
}

function renderTrick() {
  const trickDiv = document.getElementById('trick-plays');
  trickDiv.innerHTML = '';

  if (gameState.currentTrick.length === 0) {
    const empty = document.createElement('p');
    empty.style.gridColumn = '1 / -1';
    empty.style.textAlign = 'center';
    empty.style.color = 'var(--text)';
    empty.textContent = gameState.phase === 'playing' ? 'Stich lädt...' : '—';
    trickDiv.appendChild(empty);
    return;
  }

  gameState.currentTrick.forEach(play => {
    const playerName = gameState.players.find(p => p.id === play.playerId)?.name || '?';
    const div = document.createElement('div');
    div.className = 'trick-play';

    const playerDiv = document.createElement('div');
    playerDiv.className = 'trick-play-player';
    playerDiv.textContent = playerName;
    div.appendChild(playerDiv);

    const cardDiv = renderCardElement(play.card, { clickable: false });
    div.appendChild(cardDiv);

    trickDiv.appendChild(div);
  });
}

function renderHand() {
  const handDiv = document.getElementById('my-hand');
  handDiv.innerHTML = '';

  if (!gameState.you || !gameState.you.hand) {
    handDiv.innerHTML = '<p>-</p>';
    return;
  }

  gameState.you.hand.forEach(card => {
    const isLegal = gameState.phase === 'playing' && gameState.you.legalMoves.includes(card.id);
    const isDisabled = gameState.phase === 'playing' && !isLegal;

    const cardEl = renderCardElement(card, { clickable: true, disabled: isDisabled });

    if (gameState.phase === 'playing' && isLegal) {
      cardEl.addEventListener('click', () => {
        if (card.type === 'tigress') {
          selectedTigressCard = card.id;
          document.getElementById('tigress-modal').style.display = 'flex';
        } else {
          playCard(card.id, null);
        }
      });
    }

    handDiv.appendChild(cardEl);
  });
}

function renderCardElement(card, options = {}) {
  const { clickable = false, disabled = false } = options;
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';

  if (card.type === 'number') {
    cardDiv.classList.add(SUIT_COLORS[card.suit]);
    cardDiv.innerHTML = `
      <div class="card-value">${card.value}</div>
      <div class="card-suit">${SUIT_LABELS[card.suit]}</div>
    `;
  } else if (card.type === 'escape') {
    cardDiv.classList.add('special');
    cardDiv.innerHTML = '🏃<br>Flucht';
  } else if (card.type === 'pirate') {
    cardDiv.classList.add('special');
    cardDiv.innerHTML = `🏴‍☠️<br>Pirat${card.name ? '<br><small>' + card.name.substring(0, 6) + '</small>' : ''}`;
    cardDiv.style.fontSize = '12px';
  } else if (card.type === 'mermaid') {
    cardDiv.classList.add('special');
    cardDiv.innerHTML = '🧜‍♀️<br>Meer';
  } else if (card.type === 'skullking') {
    cardDiv.classList.add('special');
    cardDiv.innerHTML = '💀👑<br>Skull<br>King';
    cardDiv.style.fontSize = '14px';
  } else if (card.type === 'tigress') {
    cardDiv.classList.add('special');
    cardDiv.innerHTML = '🐯<br>Tigress';
  }

  if (disabled) {
    cardDiv.classList.add('card-disabled');
  }

  if (clickable && !disabled) {
    cardDiv.style.cursor = 'pointer';
  }

  return cardDiv;
}

function renderBiddingPhase() {
  const biddingSection = document.getElementById('bidding-section');
  biddingSection.style.display = 'flex';

  const prompt = document.getElementById('bidding-prompt');

  if (gameState.turnPlayerId === myId) {
    prompt.textContent = `Es ist dein Zug! Sag eine Zahl von 0 bis ${gameState.round} an:`;

    const bidButtons = document.getElementById('bid-buttons');
    bidButtons.innerHTML = '';
    const bidInput = document.getElementById('bid-input');
    const btnConfirm = document.getElementById('btn-confirm-bid');

    bidInput.style.display = 'block';
    bidInput.max = gameState.round;
    bidInput.value = '';
    btnConfirm.style.display = 'block';

    // Quick buttons
    for (let i = 0; i <= Math.min(gameState.round, 8); i++) {
      const btn = document.createElement('button');
      btn.className = 'bid-btn';
      btn.textContent = i;
      btn.addEventListener('click', () => {
        bidInput.value = i;
        confirmBid();
      });
      bidButtons.appendChild(btn);
    }
  } else {
    const currentPlayer = gameState.players.find(p => p.id === gameState.turnPlayerId);
    prompt.textContent = `Wartet auf ${currentPlayer?.name}...`;

    document.getElementById('bid-buttons').innerHTML = '';
    document.getElementById('bid-input').style.display = 'none';
    document.getElementById('btn-confirm-bid').style.display = 'none';
  }
}

function renderRoundEnd() {
  const section = document.getElementById('round-end-section');
  section.style.display = 'flex';

  const scoresDiv = document.getElementById('round-scores');
  scoresDiv.innerHTML = '';

  const lastScore = gameState.scoreHistory[gameState.scoreHistory.length - 1];
  if (lastScore) {
    lastScore.entries.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'score-entry';
      div.innerHTML = `
        <span><strong>${entry.name}</strong>: Bid ${entry.bid}, Stiche ${entry.tricksWon}, Bonus +${entry.bonusPoints}</span>
        <span style="color: var(--primary); font-weight: bold;">${entry.roundScore} Pkt</span>
      `;
      scoresDiv.appendChild(div);
    });
  }
}

function renderGameEnd() {
  const section = document.getElementById('game-end-section');
  section.style.display = 'flex';

  const standingsDiv = document.getElementById('final-standings');
  standingsDiv.innerHTML = '';

  const sorted = [...gameState.players].sort((a, b) => b.totalScore - a.totalScore);

  sorted.forEach((player, idx) => {
    const div = document.createElement('div');
    div.className = 'final-entry';
    if (idx === 0) div.classList.add('winner');
    div.innerHTML = `
      <span><strong>${player.name}</strong></span>
      <span>${player.totalScore} Pkt</span>
    `;
    standingsDiv.appendChild(div);
  });
}

// Helpers
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

function showError(message, screen) {
  const errorEl = document.getElementById(`error-message${screen === 'start' ? '' : `-${screen}`}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }
}

function updateConnectionStatus() {
  const status = socket.connected ? '●' : '◯';
  const color = socket.connected ? 'var(--success)' : 'var(--danger)';
  const title = socket.connected ? 'Verbunden' : 'Getrennt';

  const statusGame = document.getElementById('connection-status');
  const statusLobby = document.getElementById('connection-status-game');

  if (statusGame) {
    statusGame.textContent = status;
    statusGame.style.color = color;
    statusGame.title = title;
  }

  if (statusLobby) {
    statusLobby.textContent = status;
    statusLobby.style.color = color;
    statusLobby.title = title;
  }

  if (!socket.connected) {
    if (statusGame) statusGame.classList.add('offline');
    if (statusLobby) statusLobby.classList.add('offline');
  } else {
    if (statusGame) statusGame.classList.remove('offline');
    if (statusLobby) statusLobby.classList.remove('offline');
  }
}

function isHostPlayer(state) {
  const humans = state.players.filter(p => !p.isBot);
  return humans.length > 0 && humans[0].id === myId;
}
