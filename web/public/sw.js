const CACHE_NAME = 'mindtrack-sos-cache-v2';
const OFFLINE_URL = '/sos';

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const URLS_TO_CACHE = [
  OFFLINE_URL,
  '/sos-icon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add URLs but don't fail if some optional assets are missing
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GETs. Anything else (POST/PATCH/DELETE, WebSocket upgrades,
  // socket.io polling sentinels) must go straight to the network.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never intercept cross-origin requests. Returning `undefined` from a
  // cache miss to `respondWith` throws "Failed to convert value to 'Response'",
  // which broke the socket.io polling transport at http://localhost:3001.
  if (url.origin !== self.location.origin) return;

  // Skip the Next.js dev/runtime and any internal API routes — those need
  // to hit the network unmediated to behave correctly during development.
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/')
  ) {
    return;
  }

  // SOS route gets the offline fallback
  if (req.mode === 'navigate' || url.pathname.startsWith('/sos')) {
    event.respondWith(
      fetch(req).catch(async () => {
        const cached = await caches.match(OFFLINE_URL);
        return cached || Response.error();
      })
    );
    return;
  }

  // Everything else: network-first, fall back to cache, finally to an error
  // Response so we never hand `undefined` to respondWith.
  event.respondWith(
    fetch(req).catch(async () => {
      const cached = await caches.match(req);
      return cached || Response.error();
    })
  );
});
