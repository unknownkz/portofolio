// ================= CACHE VERSION =================

const CACHE_NAME = "axelal-cache-v2026.2.14";

// ================= FILES =================

const urlsToCache = [

  "/",
  "/index.html",
  "/style.css",
  "/script.js",

  "/profile.webp",
  "/logo-a.png",
  "/preview.png"

];

// ================= INSTALL =================

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))

  );

});

// ================= FETCH =================

self.addEventListener("fetch", event => {

  event.respondWith(

    fetch(event.request)

      .then(response => {

        const responseClone =
          response.clone();

        if(event.request.method === "GET"){

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                responseClone
              );

            });

        }

        return response;

      })

      .catch(() => {

        return caches.match(event.request);

      })

  );

});

// ================= ACTIVATE =================

self.addEventListener("activate", event => {

  self.clients.claim();

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if(key !== CACHE_NAME){
            return caches.delete(key);
          }

        })

      );

    })

  );

});
