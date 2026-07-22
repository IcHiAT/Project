'use strict';

// Bump this to force clients to pick up new assets.
const CACHE = 'skullking-v1';

// The app shell + engine needed to run offline solo games. socket.io is added
// best-effort (only used for online play, and only reachable when online).
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/localGame.js',
  '/engine/cards.js',
  '/engine/rules.js',
  '/engine/bot.js',
  '/engine/gameState.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE);
    // Best-effort: cache the socket.io client if the server is reachable now,
    // so online features survive a later offline reload. Failure is fine.
    try {
      const res = await fetch('/socket.io/socket.io.js');
      if (res.ok) await cache.put('/socket.io/socket.io.js', res.clone());
    } catch (e) { /* offline at install time - ignore */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache the realtime socket.io transport (polling/websocket) endpoints.
  if (url.pathname.startsWith('/socket.io/') && url.search) return;

  // Navigations (including shareable /r/CODE links): try network first so an
  // online player always gets the latest, fall back to the cached shell when
  // offline.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch (e) {
        const cache = await caches.open(CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // Static assets: cache-first (fast + offline), refresh cache in background.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) {
      fetch(request).then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
      }).catch(() => {});
      return cached;
    }
    try {
      const res = await fetch(request);
      if (res && res.ok && url.origin === self.location.origin) {
        cache.put(request, res.clone());
      }
      return res;
    } catch (e) {
      return Response.error();
    }
  })());
});
