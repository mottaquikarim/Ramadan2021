var CACHE_NAME = 'static-cache-v13';
var urlsToCache = [
  '.',
  'index.html',
  'styles/app.css',
  'javascript/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic-bootstrap.min.css',
];
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetchAndCache(event.request);
    })
    .catch(e => {
        console.log('failed fetch', e)
        return fetch(event.request)
    })
  );
});

function fetchAndCache(url) {
  return fetch(url)
  .then(function(response) {
    // Check if we received a valid response
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return caches.open(CACHE_NAME)
    .then(function(cache) {
      cache.put(url, response.clone());
      return response;
    });
  })
  .catch(function(error) {
    console.log('Request failed:', error);
    // try again...
    return fetch(url)
  });
}
self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
