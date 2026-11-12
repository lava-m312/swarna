// Cache name includes a build timestamp so the browser byte-compares a
// CHANGED sw.js on every deploy and installs the new worker automatically.
// BUILD_TIMESTAMP is replaced at deploy-time by the vercel.json build step
// — but even without that, every Git push changes this file, triggering an update.
const CACHE_NAME = 'swarna-spa-v1.0.5-20261112-bugfixes';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/data.js',
  '/pwa.js',
  '/manifest.json',
  '/assets/logo.jpg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-192.png',
  '/assets/icon-maskable-512.png',
  '/assets/apple-touch-icon.png',
  '/assets/favicon-32.png'
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache non-fatal item error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up previous cache versions, then tell every open client to reload
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
      .then(() => {
        // Notify every open window/tab that a new SW has taken control.
        // pwa.js listens for this message and triggers a single safe reload.
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED' }));
        });
      })
  );
});

// Fetch: Smart routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignore non-GET requests (e.g. POST, PUT, DELETE for API)
  if (request.method !== 'GET') {
    return;
  }

  // 2. API calls: Network-First with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful API responses (for read endpoints like /api/db/all)
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // If offline, check cache
          const cached = await caches.match(request);
          if (cached) return cached;

          // Otherwise return offline JSON
          return new Response(
            JSON.stringify({ offline: true, error: 'You are currently offline. Showing local data.' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 3. HTML Navigation requests: Network-First, fallback to cached index.html
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match('/index.html')) || (await caches.match('/'));
        })
    );
    return;
  }

  // 4. Static assets (CSS, JS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
