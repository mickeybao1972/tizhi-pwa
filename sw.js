// Disabled - no SW to prevent cache poisoning
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(self.registration.unregister());
  return self.clients.claim();
});
