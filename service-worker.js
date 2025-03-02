/* eslint-disable no-restricted-globals */

// Dit service worker kan worden aangepast!
// Zie https://developers.google.com/web/tools/workbox/modules
// voor de lijst van beschikbare Workbox modules, of voeg je eigen toe.

const CACHE_NAME = 'wandeldagboek-cache-v2';
const STATIC_CACHE_NAME = 'wandeldagboek-static-v2';
const DYNAMIC_CACHE_NAME = 'wandeldagboek-dynamic-v2';

// Assets die altijd in de cache moeten worden opgeslagen
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/static/css/main.chunk.css'
];

// Installeer een service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installeren...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Vooraf cachen van app shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installatie voltooid');
        return self.skipWaiting();
      })
  );
});

// Activeer en schoon oude caches op
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activeren...');
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Oude cache verwijderen:', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Cache en netwerk strategie
self.addEventListener('fetch', (event) => {
  // Skip cross-origin verzoeken
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip niet-GET verzoeken
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Chrome-extensie verzoeken
  if (event.request.url.includes('chrome-extension')) {
    return;
  }

  // Voor navigatie verzoeken, gebruik de network-first strategie
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Voor afbeeldingen, gebruik de cache-first strategie
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then((networkResponse) => {
              return caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            })
            .catch(() => {
              // Fallback voor afbeeldingen indien nodig
              return null;
            });
        })
    );
    return;
  }

  // Voor alle andere verzoeken, gebruik de stale-while-revalidate strategie
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Gebruik de cache, maar update het ook in de achtergrond
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Controleer of we een geldige response hebben
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            console.log('[Service Worker] Fetch mislukt voor:', event.request.url);
            return null;
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Luister naar push notificaties
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push ontvangen');
  
  const data = event.data.json();
  const title = data.title || 'Wandeldagboek';
  const options = {
    body: data.body || 'Er is een update beschikbaar.',
    icon: '/logo192.png',
    badge: '/favicon-32x32.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Luister naar notificatie klikken
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificatie klik');
  
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
}); 