"use strict";

/* =========================================================
   MATH KING — PWA SERVICE WORKER
   Android + iPhone + Desktop
   Offline Cache
   ========================================================= */

const CACHE_NAME = "math-king-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",

    // PWA Icons
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/apple-touch-icon.png"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {
                return cache.addAll(APP_FILES);
            })

            .then(() => {
                return self.skipWaiting();
            })

    );

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames

                        .filter(name => name !== CACHE_NAME)

                        .map(name => caches.delete(name))

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    // केवल GET requests cache होंगी
    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(event.request)

            .then(cachedResponse => {

                // पहले cache check
                if (cachedResponse) {
                    return cachedResponse;
                }


                // Cache में नहीं है तो network
                return fetch(event.request)

                    .then(networkResponse => {

                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type === "opaque"
                        ) {

                            return networkResponse;

                        }


                        // Response की copy cache में रखें
                        const responseClone =
                            networkResponse.clone();


                        caches.open(CACHE_NAME)

                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });


                        return networkResponse;

                    })

                    .catch(() => {

                        // Offline होने पर Home page
                        return caches.match("./index.html");

                    });

            })

    );

});