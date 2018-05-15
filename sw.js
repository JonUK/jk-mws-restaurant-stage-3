

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
  event.respondWith(
    // This method looks at the request and
    // finds any cached results from any of the
    // caches that the Service Worker has created.
    caches.match(event.request)
      .then(function(response) {
        // If a cache is hit, we can return the response.
        if (response) {
          return response;
        }

        // Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the request.
        var fetchRequest = event.request.clone();

        // A cache hasn't been hit so we need to perform a fetch,
        // which makes a network request and returns the data if
        // anything can be retrieved from the network.
        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloning the response since it's a stream as well.
            // Because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(OFFLINE_CACHE)
              .then(function(cache) {
                // Add the request to the cache for future queries.
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});


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
