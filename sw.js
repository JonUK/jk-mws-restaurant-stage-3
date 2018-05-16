

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

  //console.log(requestUrl);

  if (requestUrl.pathname === '/data/restaurants.json') {
    returnFromNetworkFallingBackToCache(event, requestUrl);
  // } else if (requestUrl.pathname === '/restaurant.html') {
  //
  //   console.log('restaurant.html');
  //
  //   event.respondWith(caches.match('/restaurant.html'));
  } else {
    returnFromCacheFallingBackToNetwork(event);
  }

});


function returnFromCacheFallingBackToNetwork(event) {

  event.respondWith(

    // Try and find any cached results from any of the service worker caches
    caches.match(event.request)
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
      return caches.match(event.request);
    })
  );
}


// self.addEventListener('fetch', function(event) {
//
//
//   //debugger;
//
//   // Let the browser directly handle any requests that aren't a GET
//   if (event.request.method != 'GET'){
//     return;
//   }
//
//   return caches.open(OFFLINE_CACHE).then(function(cache) {
//
//     return cache.match(event.request).then((response) => {
//
//       debugger;
//
//       if(response) {
//         console.log('Take from cache: ' + event.request.url);
//         return response;
//       }
//
//       return fetch(event.request).then((response)=>{
//         if(response.status == 404) {
//           return new Response("Not found!");
//         }
//         return response;
//       }).catch((err)=>{
//         console.log(`Caching failed! Error: ${err}`);
//       })
//     });
//   });
//
//
//
//
//
//   //returnFromCacheFallingBackToNetwork(event);
//
//   // if (event.request.url.endsWith('/data/restaurants.json')) {
//   //
//   //   //debugger;
//   //   returnFromNetworkFallingBackToCache(event);
//   //
//   // } else {
//   //   returnFromCacheFallingBackToNetwork(event);
//   // }
//
//   // self.addEventListener('fetch', function(event) {
//   //   event.respondWith(
//   //     caches.match(event.request).then(function(response) {
//   //       return response || fetch(event.request);
//   //     })
//   //   );
//   // });
//   //
//   // console.log(event.request.url);
//   // event.respondWith(fetch(event.request));
// });
//
// function returnFromNetworkFallingBackToCache(event) {
//   event.respondWith(
//     fetch(event.request).catch(function() {
//       return caches.match(event.request);
//     })
//   );
// }
//
//
// function returnFromCacheFallingBackToNetwork(event) {
//   self.addEventListener('fetch', function(event) {
//     event.respondWith(
//       caches.match(event.request).then(function(response) {
//         return response || fetch(event.request);
//       })
//     );
//   });
// }
//
//
//
