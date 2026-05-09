// ================= CACHE VERSION =================

const CACHE_NAME = "axelal-cache-v2026.1";

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

    caches.match(event.request)
      .then(response => {

        return response || fetch(event.request);

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
