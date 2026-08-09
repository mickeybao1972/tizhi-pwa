// Service Worker for 四诊体质顾问 PWA
const CACHE_NAME='sizheng-pwa-v61-mianzhen-facemap';
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
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});