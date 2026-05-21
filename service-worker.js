/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   service-worker.js  |  Production Build
   Strategy: Cache-First (static) + Network-First (navigation) + Offline fallback
   ========================================================================== */

/* ==========================================================================
   1. CONFIG
   ========================================================================== */
const SW_VERSION   = 'axelal-v3';
const CACHE_STATIC = `${SW_VERSION}-static`;
const CACHE_PAGES  = `${SW_VERSION}-pages`;
const ALL_CACHES   = [CACHE_STATIC, CACHE_PAGES];

/* --------------------------------------------------------------------------
   Critical assets — MUST cache on install.
   If any of these fail, SW install is aborted.
   -------------------------------------------------------------------------- */
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
];

/* --------------------------------------------------------------------------
   Optional assets — cached best-effort (failures are silently ignored).
   -------------------------------------------------------------------------- */
const OPTIONAL_ASSETS = [
  '/profile.webp',
  '/logo-a.png',
  '/preview.png',
  '/cv.pdf',
  '/picture/flag/id.png',
  '/picture/flag/gb.png',
];


/* ==========================================================================
   2. INSTALL — Pre-cache critical assets, then optional
   ========================================================================== */
self.addEventListener('install', event => {
  // Activate immediately — do not wait for old SW to finish
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_STATIC).then(async cache => {

      // Critical: abort install if any of these fail
      await cache.addAll(CRITICAL_ASSETS);

      // Optional: cache individually so one failure does not block others
      const optionalResults = await Promise.allSettled(
        OPTIONAL_ASSETS.map(url =>
          cache.add(url).catch(() => null) // silent fail per asset
        )
      );

      // Dev hint — remove in production if desired
      const failed = OPTIONAL_ASSETS.filter(
        (_, i) => optionalResults[i].status === 'rejected'
      );
      if (failed.length) {
        // Optional assets that could not be pre-cached (non-fatal)
      }
    })
  );
});


/* ==========================================================================
   3. ACTIVATE — Clean up old caches, claim clients
   ========================================================================== */
self.addEventListener('activate', event => {
  // Take control of all open pages immediately
  self.clients.claim();

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !ALL_CACHES.includes(key))
          .map(key => caches.delete(key))
      )
    )
  );
});


/* ==========================================================================
   4. FETCH — Route-based caching strategy
   ========================================================================== */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Route to appropriate strategy
  if (_isNavigationRequest(request)) {
    event.respondWith(_networkFirst(request));
  } else if (_isStaticAsset(url)) {
    event.respondWith(_cacheFirst(request));
  } else {
    event.respondWith(_networkFirst(request));
  }
});


/* ==========================================================================
   5. STRATEGIES
   ========================================================================== */

/* --------------------------------------------------------------------------
   Cache-First — serve from cache, fall back to network, then update cache.
   Best for: CSS, JS, images, fonts — assets that rarely change.
   -------------------------------------------------------------------------- */
async function _cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (_isCacheable(response)) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone()); // fire-and-forget is safe here (response already returned)
    }
    return response;
  } catch {
    return _offlineFallback(request);
  }
}

/* --------------------------------------------------------------------------
   Network-First — try network, update cache, fall back to cache on failure.
   Best for: HTML navigation, dynamic content.
   -------------------------------------------------------------------------- */
async function _networkFirst(request) {
  try {
    const response = await fetch(request);

    if (_isCacheable(response)) {
      const cache = await caches.open(CACHE_PAGES);
      // waitUntil not available here, but put() is fast for page responses
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? _offlineFallback(request);
  }
}


/* ==========================================================================
   6. HELPERS
   ========================================================================== */

/**
 * Returns true if the request is a browser navigation (HTML page load).
 */
function _isNavigationRequest(request) {
  return request.mode === 'navigate';
}

/**
 * Returns true if the URL points to a static asset (CSS, JS, image, font).
 */
function _isStaticAsset(url) {
  return /\.(css|js|webp|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|otf|pdf)$/i.test(url.pathname);
}

/**
 * Returns true if the response is worth storing in cache.
 * Only cache successful, non-opaque responses.
 */
function _isCacheable(response) {
  return response && response.status === 200 && response.type !== 'opaque';
}

/**
 * Graceful offline fallback.
 * Returns cached index for navigation; generic 503 for other assets.
 */
async function _offlineFallback(request) {
  if (_isNavigationRequest(request)) {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
  }

  // Generic offline response for non-navigational requests
  return new Response('Offline — resource unavailable', {
    status:  503,
    headers: { 'Content-Type': 'text/plain' },
  });
}

/* ==========================================================================
   END OF FILE
   ========================================================================== */
