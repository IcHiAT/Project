/* Service Worker – App offline verfügbar machen und Updates automatisch verteilen. */
const CACHE = 'arrarr-v15';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/scoring.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  // Jede Datei einzeln mit cache:'reload' holen, damit auch der Erstaufbau
  // wirklich frisch vom Server kommt statt aus dem HTTP-Cache des Browsers.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(
        ASSETS.map((url) => fetch(url, { cache: 'reload' }).then((res) => cache.put(url, res)))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Netzwerk-zuerst für alles: immer die aktuelle Version laden, wenn online.
// cache: 'no-store' zwingt den Browser, wirklich neu vom Server zu laden, statt
// eine evtl. noch "frische" (nicht abgelaufene) Kopie aus seinem eigenen
// HTTP-Cache zu nehmen – sonst kämen Updates trotz "Netzwerk-zuerst" verzögert an.
// Nur wenn das Netzwerk nicht erreichbar ist, wird aus dem eigenen Cache geliefert (offline-fähig).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
