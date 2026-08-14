// Service Worker for 四诊体质顾问 PWA
const CACHE_NAME='sizheng-pwa-v69';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './favicon.ico',
  './lunar.js'
];
self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  // network-first, fallback to cache
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && e.request.method === 'GET') {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
      }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
