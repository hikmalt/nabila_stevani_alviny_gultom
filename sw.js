const CACHE_NAME = 'nabila-universe-v7';

// Core assets to pre-cache (App Shell)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './birthday.html',
  './css/style.css',
  './favicon.ico',
  './favicon.png',
  './js/main.js',
  './js/birthday.js',
  './js/data.js',
  './js/gallery_data.js',
  './js/cake3d.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js'
];

// Install Event - Precache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching core assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests unless they are our known CDNs
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && !url.origin.includes('cdnjs') && !url.origin.includes('jsdelivr') && !url.origin.includes('fonts')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If found in cache, return it immediately, BUT fetch in background to update cache (Stale-While-Revalidate)
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Only cache valid responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        console.log('[Service Worker] Fetch failed, returning cache if available', err);
      });

      // Return cached response if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
