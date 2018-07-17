
const OFFLINE_CACHE_NAME = 'restaurant-cache-v4';

const urlsToCache = [
  // Network falling back to the cache
  '/data/restaurants.json',

  // Cache falling back to the network
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/sw_register.js',
  '/js/idb.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(OFFLINE_CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {

  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map((key) => {

          if (key !== OFFLINE_CACHE_NAME) {
            console.log('Removing old cache', key);
            return caches.delete(key);
          }

        }))
      })
  )
});

self.addEventListener('fetch', function(event) {

  returnFromCacheFallingBackToNetwork(event);

  // As there are currently only 9 restaurants registered, we could add the restaurant images to the
  // cache each time one is retrieved from the network. Assuming there are more restaurants added in
  // future though, this will be too much data. We will therefore rely on the standard browser cache.

});

function returnFromCacheFallingBackToNetwork(event) {

  event.respondWith(

    // Try and find any cached results from any of the service worker caches
    caches.match(event.request, { ignoreSearch: true }) // We can safely ignore query strings
      .then(function(response) {

        // If a cache is hit, we can return the response else get from the network
        if (response) {
          return response;
        }

        return fetch(event.request);
      })
  );
}
