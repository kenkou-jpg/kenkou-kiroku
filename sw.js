const CACHE_NAME = 'kenkou-kiroku-v3';
const ASSETS = [
  '/kenkou-kiroku/kk-app.html',
  '/kenkou-kiroku/css/app-main.css',
  '/kenkou-kiroku/js/kk-app.js',
  '/kenkou-kiroku/manifest.json',
  '/kenkou-kiroku/images/logo-kenkou-kiroku.png',
  '/kenkou-kiroku/images/profile-photo.png',
  '/kenkou-kiroku/images/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // ✅ chrome-extension:// など http/https 以外を除外
  if (!e.request.url.startsWith('http')) return;

  // ネットワーク優先、失敗時キャッシュ
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(e.request)
          .then(cached => cached || caches.match('/kenkou-kiroku/kk-app.html'))
      )
  );
});
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(
      data.title || 'kenkou kiroku', {
        body: data.body || '今日のからだの記録をしましょう',
        icon: '/kenkou-kiroku/images/logo-kenkou-kiroku.png',
        badge: '/kenkou-kiroku/images/logo-kenkou-kiroku.png',
        data: { url: '/kenkou-kiroku/kk-app.html' }
      }
    )
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data.url || '/kenkou-kiroku/kk-app.html')
  );
});
