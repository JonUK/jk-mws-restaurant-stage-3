importScripts('/js/idb.js');
importScripts('/js/dbhelper.js');

const OFFLINE_CACHE_NAME = 'restaurant-cache-v4';

const urlsToCache = [

  // Cache falling back to the network
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/css/restaurant.css',
  '/css/review_form.css',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/sw_register.js',
  '/js/idb.js',
  '/img/favourite-button-icon.svg',
  '/img/favourite-icon.svg'
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
            console.info('Removing old cache', key);
            return caches.delete(key);
          }

        }))
      })
  )
});

self.addEventListener('sync', function(event) {
  console.info('The service worker received a sync event', event.tag);

  if (event.tag === 'reviews-sync') {
    event.waitUntil(DBHelper.syncReviewsWithServer());
  }

  if (event.tag === 'favourites-sync') {
    event.waitUntil(DBHelper.syncFavouriteChangesWithServer());
  }

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
