// Service Worker for 四诊体质顾问 PWA
const CACHE_NAME = 'sizheng-pwa-v27';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: fetch assets with cache: 'no-store' to bypass HTTP cache,
// then write to our SW cache. This guarantees fresh code on every SW update.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(ASSETS.map(u =>
        fetch(u, { cache: 'no-store' }).then(r => {
          if (r && r.status === 200) return cache.put(u, r.clone());
        }).catch(() => {})
      ))
    ).then(() => self.skipWaiting())
  );
});

// Activate: clean ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for ALL same-origin GET requests
// (avoids stale SW cache issue: always serve fresh from network)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Network-first, fallback to cache
  event.respondWith(
    fetch(request).then(response => {
      // Update cache with fresh version
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});

// Handle messages from the main page
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});