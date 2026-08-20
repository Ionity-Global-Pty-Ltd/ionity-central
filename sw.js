// Ionity Central - Service Worker (PWA, Push & Offline AI Edge Cache)
const CACHE_NAME = 'ionity-central-v1.1.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/workspace.css',
  './css/crm.css',
  './css/scrum.css',
  './css/components.css',
  './css/ai-edge-gallery.css',
  './css/auth-screen.css',
  './css/screenshare.css',
  './css/ocr-inspector.css',
  './js/app.js',
  './js/storage.js',
  './js/auth.js',
  './js/workspace.js',
  './js/crm.js',
  './js/scrum.js',
  './js/notifications.js',
  './js/gcp-helper.js',
  './js/local-rag.js',
  './js/gemini-service.js',
  './js/ai-edge-gallery.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/ionity-logo.png',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Ionity SW] Caching app shell & static assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Ionity SW] Asset caching fallback:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Ionity SW] Clearing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation & assets cache-first with network fallback
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for cache revalidation
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Offline fallback
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Push Notifications Event Handler
self.addEventListener('push', (event) => {
  let data = { title: 'Ionity Central Alert', body: 'New notification in your workspace.', icon: './icons/icon-192.png' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Ionity Central Update',
    icon: data.icon || './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [100, 50, 100, 50, 200],
    data: {
      url: data.url || './index.html',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Open Workspace' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Ionity Central', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
