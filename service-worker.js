const CACHE_NAME = 'ippo-v1';
const ASSETS = [
  '/kenkou-kiroku/kk-app.html',
  '/kenkou-kiroku/css/app-main.css',
  '/kenkou-kiroku/js/kk-app.js',
  '/kenkou-kiroku/manifest.json',
  '/kenkou-kiroku/images/icon-192.png',
  '/kenkou-kiroku/images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
