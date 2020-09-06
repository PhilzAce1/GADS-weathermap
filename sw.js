const CACHE_NAME = 'SITE_CONTENT_V1';
var filesToCache = ['/', '/index.html', '/css/style.css', '/js/main.js'];

self.addEventListener('install', (installer) => {
  console.log('Installing');

  const done = async () => {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(urlsToCache);
  };

  installer.waitUntil(done());
});

self.addEventListener('fetch', (fetchEvent) => {
  // respond to fetch request with a match from the cache
  // if not in cache, then request from network and cache
  // if there is a server error, show the offline page
  const url = fetchEvent.request.url;

  const getResponse = async (request) => {
    let response;
    response = await caches.match(request);
    if (response && response.status === 200) {
      console.log('File in cache. Returning cached version.');
      return response;
    }

    try {
      response = await fetch(request);
      if (response && response.status === 404) {
        return caches.match('/404.html');
      }
    } catch (e) {
      return caches.match('/offline.html');
    }

    const clone = response.clone();
    const cache = await caches.open(CACHE_NAME);
    cache.put(url, clone);
    return response;
  };

  fetchEvent.respondWith(getResponse(fetchEvent.request));
});

self.addEventListener('activate', (activator) => {
  console.log('Activating');

  const currentCaches = [CACHE_NAME];
  const done = async () => {
    const names = await caches.keys();
    return Promise.all(
      names.map((name) => {
        if (!currentCaches.includes(name)) {
          return caches.delete(name);
        }
      })
    );
  };

  activator.waitUntil(done());
});

// var cacheName = 'clear-sky';
// var filesToCache = ['/', '/index.html', '/css/style.css', '/js/main.js'];

// /* Start the service worker and cache all of the app's content */
// self.addEventListener('install', function (e) {
//   e.waitUntil(
//     caches.open(cacheName).then(function (cache) {
//       return cache.addAll(filesToCache);
//     })
//   );
// });

// /* Serve cached content when offline */
// self.addEventListener('fetch', function (e) {
//   e.respondWith(
//     caches.match(e.request).then(function (response) {
//       return response || fetch(e.request);
//     })
//   );
// });
