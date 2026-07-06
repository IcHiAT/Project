/* Skull King Punktezähler – App-Logik & UI (Vanilla JS). */
'use strict';

const STORAGE_KEY = 'skullking-state-v1';
const DEFAULT_ROUNDS = 10;
const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;

/* ---------- State ---------- */

function freshState() {
  return {
    screen: 'setup',
    players: [
      { id: pid(), name: '' },
      { id: pid(), name: '' },
    ],
    totalRounds: DEFAULT_ROUNDS,
    currentRound: 1,
    scores: {},   // { playerId: [{bid,tricks,bonus}, ...] }  (eine je abgeschlossener Runde)
    draft: {},    // { playerId: {bid,tricks,bonus} }  (aktuelle Runde)
    gameTab: 'entry',
  };
}

let state = loadState() || freshState();

function pid() {
  return 'p' + Math.random().toString(36).slice(2, 9);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* Speicher voll / privat – ignorieren */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function resetGame() {
  state = freshState();
  saveState();
  render();
}

/* ---------- Helpers ---------- */

function playerName(p, idx) {
  return (p.name && p.name.trim()) || `Spieler ${idx + 1}`;
}

function totalFor(playerId) {
  const rounds = state.scores[playerId] || [];
  return rounds.reduce((sum, r, i) => (r ? sum + scoreRound(i + 1, r.bid, r.tricks, r.bonus) : sum), 0);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---------- Render dispatcher ---------- */

const appEl = document.getElementById('app');

function render() {
  // Standard ist die alte Version. Einmalige Umstellung, damit auch bereits
  // gespeicherte Spielstände (die evtl. noch 'neu' hatten) auf 'alt' starten.
  // Danach bleibt die eigene Wahl über den Umschalter erhalten.
  if (!state.editionDefaulted) { state.edition = 'alt'; state.editionDefaulted = true; }
  if (!state.edition) state.edition = 'alt';
  saveState();
  appEl.innerHTML = '';
  appEl.appendChild(header());
  if (state.screen === 'setup') renderSetup();
  else if (state.screen === 'game') renderGame();
  else if (state.screen === 'results') renderResults();
  appEl.appendChild(el('<p class="footer-note">ArrArr – Piraten ahoi · Skull-King-Punktezähler · funktioniert offline</p>'));
}

function header() {
  const isOld = state.edition === 'alt';
  const h = el(`
    <div class="app-header">
      <svg class="logo" viewBox="0 0 512 512" aria-hidden="true">
        <defs>
          <linearGradient id="lg-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#163e6b"/><stop offset="1" stop-color="#0a1c30"/>
          </linearGradient>
          <linearGradient id="lg-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffdd66"/><stop offset="1" stop-color="#c9a227"/>
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill="url(#lg-bg)"/>
        <g class="logo-crown">
          <path d="M150 168 L150 138 L196 172 L256 118 L316 172 L362 138 L362 168 L340 208 L172 208 Z" fill="url(#lg-gold)" stroke="#8a6d13" stroke-width="4" stroke-linejoin="round"/>
          <circle cx="150" cy="132" r="12" fill="url(#lg-gold)"/>
          <circle cx="256" cy="112" r="13" fill="url(#lg-gold)"/>
          <circle cx="362" cy="132" r="12" fill="url(#lg-gold)"/>
        </g>
        <path d="M256 214 C186 214 150 262 150 314 C150 356 176 384 200 396 L200 428 C200 440 210 448 222 448 L290 448 C302 448 312 440 312 428 L312 396 C336 384 362 356 362 314 C362 262 326 214 256 214 Z" fill="#f4f8ff"/>
        <ellipse class="logo-eye" cx="212" cy="318" rx="30" ry="34" fill="#0a1c30"/>
        <ellipse cx="300" cy="318" rx="30" ry="34" fill="#0a1c30"/>
        <path d="M256 342 L240 384 L272 384 Z" fill="#0a1c30"/>
        <g fill="#0a1c30">
          <rect x="222" y="416" width="14" height="24" rx="3"/>
          <rect x="249" y="416" width="14" height="26" rx="3"/>
          <rect x="276" y="416" width="14" height="24" rx="3"/>
        </g>
      </svg>
      <div>
        <h1>ArrArr</h1>
        <div class="sub">Piraten ahoi</div>
      </div>
      <div class="spacer"></div>
      <button class="version-toggle ${isOld ? 'alt' : 'neu'}" aria-label="Spielversion umschalten">
        <span class="vdot"></span>${isOld ? 'Alte Version' : 'Neue Version'}
      </button>
    </div>
  `);
  h.querySelector('.version-toggle').addEventListener('click', () => {
    state.edition = state.edition === 'alt' ? 'neu' : 'alt';
    render();
  });
  return h;
}

/* ---------- Setup screen ---------- */

function renderSetup() {
  const hasSavedGame = state.screen === 'setup' && Object.keys(state.scores).length > 0;

  const panel = el('<div class="panel"><h2>Spieler*innen</h2></div>');
  const list = el('<div id="player-list"></div>');

  state.players.forEach((p, i) => {
    const row = el(`
      <div class="player-input" data-id="${p.id}">
        <span class="num">${i + 1}</span>
        <input type="text" maxlength="20" placeholder="Name Spieler ${i + 1}" value="${escapeHtml(p.name)}" />
        <button class="icon-btn" data-act="remove" aria-label="Entfernen">&times;</button>
      </div>
    `);
    const input = row.querySelector('input');
    input.addEventListener('input', (e) => {
      const pl = state.players.find((x) => x.id === p.id);
      if (pl) pl.name = e.target.value;
      saveState();
    });
    const rm = row.querySelector('[data-act="remove"]');
    rm.disabled = state.players.length <= MIN_PLAYERS;
    rm.addEventListener('click', () => {
      state.players = state.players.filter((x) => x.id !== p.id);
      render();
    });
    list.appendChild(row);
  });

  panel.appendChild(list);

  const addBtn = el('<button class="btn ghost mt">+ Spieler*in hinzufügen</button>');
  addBtn.disabled = state.players.length >= MAX_PLAYERS;
  addBtn.addEventListener('click', () => {
    if (state.players.length < MAX_PLAYERS) {
      state.players.push({ id: pid(), name: '' });
      render();
    }
  });
  panel.appendChild(addBtn);
  appEl.appendChild(panel);

  // Rundenanzahl
  const optsPanel = el('<div class="panel"><h2>Runden</h2></div>');
  const roundRow = el(`
    <div class="stepper" style="justify-content:space-between">
      <span class="muted">Anzahl Runden</span>
      <div class="stepper">
        <button data-act="r-minus">−</button>
        <span class="val">${state.totalRounds}</span>
        <button data-act="r-plus">+</button>
      </div>
    </div>
  `);
  roundRow.querySelector('[data-act="r-minus"]').addEventListener('click', () => {
    state.totalRounds = clamp(state.totalRounds - 1, 1, 20); render();
  });
  roundRow.querySelector('[data-act="r-plus"]').addEventListener('click', () => {
    state.totalRounds = clamp(state.totalRounds + 1, 1, 20); render();
  });
  optsPanel.appendChild(roundRow);
  optsPanel.appendChild(el('<p class="hint">Standard sind 10 Runden (Runde N = N Karten).</p>'));
  appEl.appendChild(optsPanel);

  const start = el('<button class="btn">Spiel starten</button>');
  start.addEventListener('click', startGame);
  appEl.appendChild(start);

  if (hasSavedGame) {
    const resume = el('<button class="btn secondary mt">Laufendes Spiel fortsetzen</button>');
    resume.addEventListener('click', () => { state.screen = 'game'; render(); });
    appEl.appendChild(resume);
  }
}

function startGame() {
  // Namen finalisieren (leere durch Standardnamen ersetzen bleibt visuell via playerName)
  state.scores = {};
  state.draft = {};
  state.players.forEach((p) => { state.scores[p.id] = []; });
  state.currentRound = 1;
  state.screen = 'game';
  state.gameTab = 'entry';
  render();
}

/* ---------- Game screen ---------- */

// Bonuspunkte aus den gefangenen Karten berechnen.
// In der alten Version zählen die 14er-Boni (farbige 14 / Jolly Roger) nicht.
function calcBonus(d) {
  const with14 = state.edition !== 'alt';
  const b14 = with14 ? 10 * (d.c14 || 0) + 20 * (d.b14 || 0) : 0;
  return b14 + 30 * (d.pirates || 0) + 50 * (d.mermaid || 0);
}

function emptyDraft() {
  return { bid: 0, tricks: 0, c14: 0, b14: 0, pirates: 0, mermaid: 0 };
}

function getDraft(playerId) {
  if (!state.draft[playerId]) state.draft[playerId] = emptyDraft();
  const d = state.draft[playerId];
  // Absicherung, falls ein älterer Spielstand ohne Bonus-Details geladen wurde.
  if (d.c14 === undefined) { d.c14 = 0; d.b14 = 0; d.pirates = 0; d.mermaid = 0; }
  return d;
}

function renderGame() {
  // Tabs
  const tabs = el(`
    <div class="tabs">
      <button data-tab="entry" class="${state.gameTab === 'entry' ? 'active' : ''}">Runde ${state.currentRound}</button>
      <button data-tab="board" class="${state.gameTab === 'board' ? 'active' : ''}">Punktetafel</button>
    </div>
  `);
  tabs.querySelector('[data-tab="entry"]').addEventListener('click', () => { state.gameTab = 'entry'; render(); });
  tabs.querySelector('[data-tab="board"]').addEventListener('click', () => { state.gameTab = 'board'; render(); });
  appEl.appendChild(tabs);

  if (state.gameTab === 'board') { renderBoard(); return; }

  if (!state.bonusOpen) state.bonusOpen = {}; // welche Bonus-Bereiche sind aufgeklappt

  // Rundenkopf
  const bar = el(`
    <div class="round-bar">
      <div class="round-num">Runde ${state.currentRound}<small> / ${state.totalRounds}</small></div>
      <div class="cards">${state.currentRound} ${state.currentRound === 1 ? 'Karte' : 'Karten'}</div>
    </div>
  `);
  appEl.appendChild(bar);

  const maxTricks = state.currentRound;

  state.players.forEach((p, idx) => {
    const d = getDraft(p.id);
    d.bid = clamp(d.bid, 0, maxTricks);
    d.tricks = clamp(d.tricks, 0, maxTricks);
    const bonus = calcBonus(d);
    const open = !!state.bonusOpen[p.id];

    const rows14 = state.edition === 'alt' ? '' : `
        <div class="brow">
          <span class="blabel">Farbige 14 gefangen<em>je +10</em></span>
          <div class="stepper mini">
            <button data-act="c14-" aria-label="Farbige 14 weniger">−</button>
            <span class="val">${d.c14}</span>
            <button data-act="c14+" aria-label="Farbige 14 mehr">+</button>
          </div>
        </div>
        <div class="brow">
          <span class="blabel">Schwarze 14 · Jolly Roger<em>+20</em></span>
          <button class="toggle ${d.b14 ? 'on' : ''}" data-act="b14">${d.b14 ? 'Ja' : 'Nein'}</button>
        </div>`;

    const detailHtml = open ? `
      <div class="bonus-detail">
        ${rows14}
        <div class="brow">
          <span class="blabel">Skull King fängt Pirat<em>je +30</em></span>
          <div class="stepper mini">
            <button data-act="pir-" aria-label="Piraten weniger">−</button>
            <span class="val">${d.pirates}</span>
            <button data-act="pir+" aria-label="Piraten mehr">+</button>
          </div>
        </div>
        <div class="brow">
          <span class="blabel">Meerjungfrau fängt Skull King<em>+50</em></span>
          <button class="toggle ${d.mermaid ? 'on' : ''}" data-act="mer">${d.mermaid ? 'Ja' : 'Nein'}</button>
        </div>
      </div>` : '';

    const entry = el(`
      <div class="entry">
        <div class="entry-top">
          <span class="entry-name">${escapeHtml(playerName(p, idx))}</span>
          <span class="entry-total">Gesamt: <b>${totalFor(p.id)}</b></span>
        </div>
        <div class="fields two">
          <div class="field">
            <label>Gebot</label>
            <div class="stepper">
              <button data-act="bid-" aria-label="Gebot -">−</button>
              <span class="val">${d.bid}</span>
              <button data-act="bid+" aria-label="Gebot +">+</button>
            </div>
          </div>
          <div class="field">
            <label>Stiche</label>
            <div class="stepper">
              <button data-act="tr-" aria-label="Stiche -">−</button>
              <span class="val">${d.tricks}</span>
              <button data-act="tr+" aria-label="Stiche +">+</button>
            </div>
          </div>
        </div>
        <button class="bonus-summary ${open ? 'open' : ''}" data-act="bonus-toggle">
          <span class="bchip">🏴‍☠️ Bonus</span>
          <span class="bval">+${bonus}</span>
          <span class="bhint">${open ? 'zuklappen' : 'Fänge eintragen'}</span>
          <span class="bcaret">${open ? '▾' : '▸'}</span>
        </button>
        ${detailHtml}
      </div>
    `);

    const bind = (sel, fn) => {
      const btn = entry.querySelector(sel);
      if (btn) btn.addEventListener('click', () => { fn(); render(); });
    };
    bind('[data-act="bid-"]', () => d.bid = clamp(d.bid - 1, 0, maxTricks));
    bind('[data-act="bid+"]', () => d.bid = clamp(d.bid + 1, 0, maxTricks));
    bind('[data-act="tr-"]', () => d.tricks = clamp(d.tricks - 1, 0, maxTricks));
    bind('[data-act="tr+"]', () => d.tricks = clamp(d.tricks + 1, 0, maxTricks));
    bind('[data-act="bonus-toggle"]', () => { state.bonusOpen[p.id] = !state.bonusOpen[p.id]; });
    bind('[data-act="c14-"]', () => d.c14 = clamp(d.c14 - 1, 0, 3));
    bind('[data-act="c14+"]', () => d.c14 = clamp(d.c14 + 1, 0, 3));
    bind('[data-act="b14"]', () => d.b14 = d.b14 ? 0 : 1);
    bind('[data-act="pir-"]', () => d.pirates = clamp(d.pirates - 1, 0, 5));
    bind('[data-act="pir+"]', () => d.pirates = clamp(d.pirates + 1, 0, 5));
    bind('[data-act="mer"]', () => d.mermaid = d.mermaid ? 0 : 1);

    appEl.appendChild(entry);
  });

  // Stich-Summenhinweis
  const trickSum = state.players.reduce((s, p) => s + getDraft(p.id).tricks, 0);
  const hintWrap = el('<div></div>');
  if (trickSum !== maxTricks) {
    hintWrap.appendChild(el(`<p class="hint warn">Hinweis: Summe der Stiche ist ${trickSum}, sollte aber ${maxTricks} sein.</p>`));
  } else {
    hintWrap.appendChild(el(`<p class="hint">Summe der Stiche: ${trickSum} ✓</p>`));
  }
  const infoBtn = el('<button class="link">Was zählt als Bonus?</button>');
  infoBtn.addEventListener('click', () => document.getElementById('bonus-info').showModal());
  hintWrap.appendChild(infoBtn);
  appEl.appendChild(hintWrap);

  // Aktionen
  const next = el(`<button class="btn mt">${state.currentRound >= state.totalRounds ? 'Spiel beenden' : 'Runde abschließen'}</button>`);
  next.addEventListener('click', completeRound);
  appEl.appendChild(next);

  const row = el('<div class="btn-row"></div>');
  const undo = el('<button class="btn secondary">Runde zurück</button>');
  undo.disabled = state.currentRound <= 1;
  undo.addEventListener('click', undoRound);
  row.appendChild(undo);
  const abort = el('<button class="btn danger">Neues Spiel</button>');
  abort.addEventListener('click', confirmReset);
  row.appendChild(abort);
  appEl.appendChild(row);
}

function completeRound() {
  state.players.forEach((p) => {
    const d = getDraft(p.id);
    if (!state.scores[p.id]) state.scores[p.id] = [];
    state.scores[p.id][state.currentRound - 1] = {
      bid: d.bid, tricks: d.tricks, bonus: calcBonus(d),
      c14: d.c14, b14: d.b14, pirates: d.pirates, mermaid: d.mermaid,
    };
  });
  state.draft = {};
  if (state.currentRound >= state.totalRounds) {
    state.screen = 'results';
  } else {
    state.currentRound += 1;
  }
  state.gameTab = 'entry';
  render();
}

function undoRound() {
  if (state.currentRound <= 1) return;
  state.currentRound -= 1;
  // Vorherige Runde als Draft zurückladen
  state.draft = {};
  state.players.forEach((p) => {
    const arr = state.scores[p.id] || [];
    const prev = arr[state.currentRound - 1];
    state.draft[p.id] = prev ? { ...emptyDraft(), ...prev } : emptyDraft();
    arr.splice(state.currentRound - 1, 1); // abgeschlossene Runde entfernen, damit sie neu eingegeben werden kann
    state.scores[p.id] = arr;
  });
  render();
}

function confirmReset() {
  if (confirm('Aktuelles Spiel verwerfen und neu beginnen?')) resetGame();
}

/* ---------- Scoreboard ---------- */

function renderBoard() {
  const maxDone = state.players.reduce((m, p) => Math.max(m, (state.scores[p.id] || []).filter(Boolean).length), 0);

  const wrap = el('<div class="panel"><div class="table-wrap"></div></div>');
  const table = el('<table class="board"></table>');

  // Kopf
  let head = '<thead><tr><th class="rowhead">Runde</th>';
  state.players.forEach((p, i) => { head += `<th>${escapeHtml(playerName(p, i))}</th>`; });
  head += '</tr></thead>';
  table.innerHTML = head;

  const tbody = el('<tbody></tbody>');
  for (let r = 0; r < maxDone; r++) {
    let row = `<tr><td class="rowhead">${r + 1}</td>`;
    state.players.forEach((p) => {
      const e = (state.scores[p.id] || [])[r];
      if (!e) { row += '<td class="muted">–</td>'; return; }
      const pts = scoreRound(r + 1, e.bid, e.tricks, e.bonus);
      const cls = pts >= 0 ? 'pos' : 'neg';
      row += `<td class="pts ${cls}">${pts > 0 ? '+' : ''}${pts}</td>`;
    });
    row += '</tr>';
    tbody.appendChild(el(row));
  }

  // Summenzeile
  let totalRow = '<tr class="total-row"><td class="name rowhead">Gesamt</td>';
  state.players.forEach((p) => { totalRow += `<td>${totalFor(p.id)}</td>`; });
  totalRow += '</tr>';
  tbody.appendChild(el(totalRow));

  table.appendChild(tbody);
  wrap.querySelector('.table-wrap').appendChild(table);
  appEl.appendChild(wrap);

  if (maxDone === 0) {
    appEl.appendChild(el('<p class="hint center">Noch keine Runde abgeschlossen.</p>'));
  }
}

/* ---------- Results ---------- */

function renderResults() {
  const ranked = state.players
    .map((p, i) => ({ p, i, total: totalFor(p.id) }))
    .sort((a, b) => b.total - a.total);

  const panel = el('<div class="panel"><h2 class="center">🏆 Endstand</h2></div>');
  const medals = ['🥇', '🥈', '🥉'];
  ranked.forEach((r, rank) => {
    const rowEl = el(`
      <div class="rank ${rank === 0 ? 'first' : ''}">
        <span class="medal">${medals[rank] || (rank + 1) + '.'}</span>
        <span class="rname">${escapeHtml(playerName(r.p, r.i))}</span>
        <span class="rscore">${r.total}</span>
      </div>
    `);
    panel.appendChild(rowEl);
  });
  appEl.appendChild(panel);

  const boardBtn = el('<button class="btn secondary">Punktetafel ansehen</button>');
  boardBtn.addEventListener('click', () => { state.screen = 'game'; state.gameTab = 'board'; render(); });
  appEl.appendChild(boardBtn);

  const again = el('<button class="btn mt">Neues Spiel</button>');
  again.addEventListener('click', resetGame);
  appEl.appendChild(again);
}

/* ---------- Boot ---------- */

/* ---------- Logo-Animation (zufällig alle 8–20 s) ---------- */

let logoAnimStarted = false;
function startLogoAnimator() {
  if (logoAnimStarted) return;
  // Nutzer, die Bewegung reduzieren möchten, bekommen keine Animation.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  logoAnimStarted = true;

  const nextDelay = () => 5000; // Debug: alle 5 Sekunden (normal: 8000 + Math.random() * 12000)

  const tick = () => {
    const logo = document.querySelector('.app-header .logo');
    if (logo) {
      const anim = Math.random() < 0.5 ? 'wink' : 'wobble'; // zwinkern oder Krone wackeln
      logo.classList.remove('wink', 'wobble');
      void logo.offsetWidth; // Reflow erzwingen, damit die Animation sicher neu startet
      logo.classList.add(anim);
      setTimeout(() => logo.classList.remove(anim), 1500);
    }
    setTimeout(tick, nextDelay());
  };
  setTimeout(tick, nextDelay());
}

// Falls ein altes Spiel im Ergebnis-Screen gespeichert war, direkt anzeigen.
render();
startLogoAnimator();
