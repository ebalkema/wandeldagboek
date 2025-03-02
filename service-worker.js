/* eslint-disable no-restricted-globals */

// Dit service worker kan worden aangepast!
// Zie https://developers.google.com/web/tools/workbox/modules
// voor de lijst van beschikbare Workbox modules, of voeg je eigen toe.

const CACHE_NAME = 'wandeldagboek-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Installeer een service worker
self.addEventListener('install', (event) => {
  // Uitvoeren van installatiestappen
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geopend');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache en retourneer verzoeken
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retourneer
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Controleer of we een geldige response hebben
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // BELANGRIJK: Clone de response.
            // Een response is een stream en kan maar één keer worden gebruikt.
            // Omdat we zowel de cache als de browser willen bedienen,
            // moeten we het klonen zodat we een exemplaar aan de cache kunnen geven
            // en de andere kunnen we naar de browser sturen.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Als het netwerk mislukt, probeer een offline fallback te bieden
        return caches.match('/index.html');
      })
  );
});

// Update een service worker
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            // Als de huidige cache niet in onze allowlist staat, verwijder het
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
}); 