
const OFFLINE_CACHE = 'restaurant-cache-v1';

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
  '/js/sw_register.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(OFFLINE_CACHE)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {

  let requestUrl = new URL(event.request.url);

  if (requestUrl.pathname === '/data/restaurants.json') {
    returnFromNetworkFallingBackToCache(event, requestUrl); // Want the data to be as current as possible
  } else {
    returnFromCacheFallingBackToNetwork(event);
  }

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

function returnFromNetworkFallingBackToCache(event, requestUrl) {

  console.log('Get from network falling back to cache', requestUrl.href);

  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request, { ignoreSearch: true }); // We can safely ignore query strings
    })
  );
}
