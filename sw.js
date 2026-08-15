// V3.4.11 sw.js: pass-through + clean install
// On install: clear all caches + unregister self (so SW won't interfere on next page load)
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.registration.unregister();
    } catch(e){}
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try {
      await self.registration.unregister();
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.clients.claim();
    } catch(e){}
  })());
});
// NO fetch handler — all requests go straight to network (no SW interception)