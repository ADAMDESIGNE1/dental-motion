const CACHE_NAME =
  "adam-design-pwa-v2";

const STATIC_ASSETS = [
  "/admin-app.webmanifest",
  "/doctor-app.webmanifest",
  "/pwa/admin-192.png",
  "/pwa/admin-512.png",
  "/pwa/doctor-192.png",
  "/pwa/doctor-512.png",
];

self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache.addAll(
            STATIC_ASSETS
          )
        )
    );

    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter(
                (key) =>
                  key !==
                  CACHE_NAME
              )
              .map((key) =>
                caches.delete(
                  key
                )
              )
          )
        )
    );

    self.clients.claim();
  }
);

self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url
      );

    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    /*
     * Important:
     * We cache ONLY PWA icons/manifests.
     * Admin/doctor pages, Supabase calls,
     * receipts and private data are NOT cached.
     */
    if (
      !STATIC_ASSETS.includes(
        url.pathname
      )
    ) {
      return;
    }

    event.respondWith(
      caches
        .match(request)
        .then(
          (cached) =>
            cached ||
            fetch(request)
              .then(
                (
                  response
                ) => {
                  const copy =
                    response.clone();

                  caches
                    .open(
                      CACHE_NAME
                    )
                    .then(
                      (
                        cache
                      ) =>
                        cache.put(
                          request,
                          copy
                        )
                    );

                  return response;
                }
              )
        )
    );
  }
);
