/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   service-worker.js  |  Production Build  |  vX.X
   Strategy: Cache-First (static) + Network-First (navigation) + Auto Update
   ========================================================================== */

/* ==========================================================================
   1. CONFIG — VERSIONING & UPDATE TYPE
   --------------------------------------------------------------------------
   Format : axelal-vMAJOR.MINOR
   Contoh : axelal-v4.1

   KAPAN NAIKKAN VERSI:
   ┌─────────────────────────────────────────────────────────────────────┐
   │  MAJOR (angka depan)  → v4 → v5                                    │
   │  Gunakan saat: fitur baru besar, redesign, perubahan struktur HTML  │
   │                                                                     │
   │  MINOR (angka belakang) → v4.1 → v4.2 → v4.3                      │
   │  Gunakan saat: update teks, ganti foto, fix CSS, tweak warna, dll  │
   └─────────────────────────────────────────────────────────────────────┘

   UPDATE_TYPE — Kontrol jenis toast yang muncul di user:
   ┌─────────────────────────────────────────────────────────────────────┐
   │  'content'  → Toast biasa: "Perbarui" → reload halaman             │
   │  Gunakan saat: update HTML, CSS, JS, teks, foto, konten apapun     │
   │                                                                     │
   │  'manifest' → Toast khusus: "Reinstall App" + "Perbarui Konten"   │
   │  Gunakan saat: ganti icon app, nama app, warna splash screen        │
   │  User perlu uninstall → install ulang agar icon/nama berubah        │
   └─────────────────────────────────────────────────────────────────────┘

   ATURAN: Setiap deploy ke server = WAJIB naikkan SW_VERSION.
   Tanpa itu, user tidak akan dapat notifikasi update.

   Contoh alur:
   v4.1  → update foto profil         → v4.2  UPDATE_TYPE = 'content'
   v4.2  → ganti icon app             → v4.3  UPDATE_TYPE = 'manifest'
   v4.3  → tambah section baru        → v5    UPDATE_TYPE = 'content'
   v5    → ganti nama app             → v5.1  UPDATE_TYPE = 'manifest'
   ========================================================================== */
const SW_VERSION   = 'axelal-v5.16';
const UPDATE_TYPE  = 'content'; // 'content' | 'manifest'

const CACHE_STATIC = `${SW_VERSION}-static`;
const CACHE_PAGES  = `${SW_VERSION}-pages`;
const ALL_CACHES   = [CACHE_STATIC, CACHE_PAGES];

const CRITICAL_ASSETS = [
  '/',
  '/js/script.min.js',
  '/chat/chat-widget.min.js',
  '/chat/chat-widget.min.css',
  '/index.html',
  '/style.css',
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
   2. INSTALL — Pre-cache assets, broadcast version + update type to clients
   ========================================================================== */
self.addEventListener('install', event => {
  // Do NOT skipWaiting — UpdateManager controls when to activate

  event.waitUntil(
    caches.open(CACHE_STATIC).then(async cache => {
      // Critical assets must all succeed
      await cache.addAll(CRITICAL_ASSETS);

      // Optional assets — silent per-file failure
      await Promise.allSettled(
        OPTIONAL_ASSETS.map(url => cache.add(url).catch(() => null))
      );

      // Notify all open clients: new version waiting + what kind of update
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client =>
        client.postMessage({
          type:       'SW_WAITING',
          version:    SW_VERSION,
          updateType: UPDATE_TYPE,
        })
      );
    })
  );
});


/* ==========================================================================
   3. ACTIVATE — Clean old caches, claim clients, broadcast activation
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
      // Notify all tabs: new SW is now active → trigger reload
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client =>
          client.postMessage({
            type:       'SW_ACTIVATED',
            version:    SW_VERSION,
            updateType: UPDATE_TYPE,
          })
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
   5. MESSAGE — SKIP_WAITING + GET_VERSION + CLEAR_CACHE
   ========================================================================== */
self.addEventListener('message', async event => {
  const { type } = event.data ?? {};

  // User clicked "Update" → activate new SW immediately
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // UpdateManager queries version + updateType (SW already waiting on page load)
  if (type === 'GET_VERSION' && event.ports[0]) {
    event.ports[0].postMessage({
      version:    SW_VERSION,
      updateType: UPDATE_TYPE,
    });
  }

  // Clear ALL caches before reinstall — prevents stale cache update loop
  // Called by UpdateManager._triggerInstall() before showing install prompt
  if (type === 'CLEAR_CACHE') {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    } catch {
      // Silent fail — proceed anyway
    } finally {
      // Notify UpdateManager cache is cleared, then activate
      if (event.ports[0]) {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      }
      self.skipWaiting();
    }
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
