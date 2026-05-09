// ================= CACHE VERSION =================

const CACHE_NAME = "axelal-cache-v2026.2.05";

// ================= FILES =================

const urlsToCache = [

  "/",
  "/index.html",
  "/style.css?v=999",
  "/script.js?v=999",

  "/profile.png",
  "/logo-a.png",
  "/preview.png",

  "/cv.pdf"

];

// ================= INSTALL =================

self.addEventListener("install", event => {

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

        const responseClone = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {

            cache.put(event.request, responseClone);

          });

        return response;

      })

      .catch(() => {

        return caches.match(event.request);

      })

  );

});

// ================= ACTIVATE =================

self.addEventListener("activate", event => {

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
