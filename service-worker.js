/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   service-worker.js  |  Production Build  |  v4
   Strategy: Cache-First (static) + Network-First (navigation) + Auto Update
   ========================================================================== */

/* ==========================================================================
   1. CONFIG
   ========================================================================== */
const SW_VERSION   = 'axelal-v4.62';
const CACHE_STATIC = `${SW_VERSION}-static`;
const CACHE_PAGES  = `${SW_VERSION}-pages`;
const ALL_CACHES   = [CACHE_STATIC, CACHE_PAGES];

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
];

const OPTIONAL_ASSETS = [
  '/profile.webp',
  '/logo-a.png',
  '/preview.png',
  '/cv.pdf',
  '/picture/flag/id.png',
  '/picture/flag/gb.png',
  '/picture/icons/icon-48.png',
  '/picture/icons/icon-72.png',
  '/picture/icons/icon-96.png',
  '/picture/icons/icon-128.png',
  '/picture/icons/icon-192.png',
  '/picture/icons/icon-512.png',
  '/picture/icons/icon-maskable.png',
  
];


/* ==========================================================================
   2. INSTALL — Pre-cache assets, then notify waiting clients of new version
   ========================================================================== */
self.addEventListener('install', event => {
  // Do NOT skipWaiting here — UpdateManager controls when to activate

  event.waitUntil(
    caches.open(CACHE_STATIC).then(async cache => {
      // Critical assets must all succeed
      await cache.addAll(CRITICAL_ASSETS);

      // Optional assets — silent per-file failure
      await Promise.allSettled(
        OPTIONAL_ASSETS.map(url => cache.add(url).catch(() => null))
      );

      // Notify ALL open clients that a new version is waiting
      // This is how UpdateManager knows the version number BEFORE activation
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client =>
        client.postMessage({ type: 'SW_WAITING', version: SW_VERSION })
      );
    })
  );
});


/* ==========================================================================
   3. ACTIVATE — Clean old caches, claim clients, broadcast update done
   ========================================================================== */
self.addEventListener('activate', event => {
  self.clients.claim();

  event.waitUntil(
    Promise.all([
      // Delete stale caches
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => !ALL_CACHES.includes(key))
            .map(key => caches.delete(key))
        )
      ),
      // Notify all tabs that this version is now fully active → trigger reload
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client =>
          client.postMessage({ type: 'SW_ACTIVATED', version: SW_VERSION })
        );
      }),
    ])
  );
});


/* ==========================================================================
   4. FETCH — Route-based caching strategy
   ========================================================================== */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== location.origin) return;

  if (_isNavigationRequest(request)) {
    event.respondWith(_networkFirst(request));
  } else if (_isStaticAsset(url)) {
    event.respondWith(_cacheFirst(request));
  } else {
    event.respondWith(_networkFirst(request));
  }
});


/* ==========================================================================
   5. MESSAGE — SKIP_WAITING + GET_VERSION
   ========================================================================== */
self.addEventListener('message', event => {
  // UpdateManager user clicks "Update" → activate new SW immediately
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // UpdateManager queries version on page load (Case 1: SW already waiting)
  if (event.data?.type === 'GET_VERSION' && event.ports[0]) {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});


/* ==========================================================================
   6. STRATEGIES
   ========================================================================== */
async function _cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (_isCacheable(response)) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return _offlineFallback(request);
  }
}

async function _networkFirst(request) {
  try {
    const response = await fetch(request);
    if (_isCacheable(response)) {
      const cache = await caches.open(CACHE_PAGES);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? _offlineFallback(request);
  }
}


/* ==========================================================================
   7. HELPERS
   ========================================================================== */
function _isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function _isStaticAsset(url) {
  return /\.(css|js|webp|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|otf|pdf)$/i.test(url.pathname);
}

function _isCacheable(response) {
  return response && response.status === 200 && response.type !== 'opaque';
}

async function _offlineFallback(request) {
  if (_isNavigationRequest(request)) {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
  }
  return new Response('Offline — resource unavailable', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' },
  });
}

/* ==========================================================================
   END OF FILE
   ========================================================================== */
     
