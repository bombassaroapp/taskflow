const CACHE_NAME = 'taskflow-v3';
const BASE = '/taskflow/';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});

// Recebe mensagem do app para exibir notificação
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge } = e.data;
    self.registration.showNotification(title, {
      body,
      icon: icon || BASE + 'icon-192.png',
      badge: badge || BASE + 'icon-192.png',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'open', title: '✅ Abrir TaskFlow' },
        { action: 'dismiss', title: '✕ Dispensar' }
      ]
    });
  }
});

// Clique na notificação abre o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('/taskflow/') && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('https://bombassaroapp.github.io/taskflow/');
    })
  );
});
