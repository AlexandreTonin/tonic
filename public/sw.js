const APP_CACHE = 'tonic-app-v1';
const SAMPLE_CACHE = 'tonic-samples-v1';
const PRECACHE = ['/', '/site.webmanifest', '/favicon.svg', '/icon-192.png'];
const SAMPLE_HOSTS = ['gleitz.github.io', 'goldst.dev', 'smpldsnds.github.io'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_CACHE && key !== SAMPLE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, fallback) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(fallback ?? request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(fallback ?? request);
    if (cached) return cached;
    throw new Error('offline');
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (SAMPLE_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(SAMPLE_CACHE, request));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/'));
    return;
  }
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(APP_CACHE, request));
    return;
  }
  event.respondWith(networkFirst(request));
});
