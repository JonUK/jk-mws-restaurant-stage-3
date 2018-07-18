/**
 * Variable to hold a promise for the restaurant data that can be reused across
 * different function calls to get the restaurant data.
 */
let restaurantsPromise;

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Server URL.
   * Change this to the restaurants JSON on your server.
   */
  static get SERVER_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Get an instance of the indexedDB promise for the database
   */
  static openDatabase() {
    return idb.open('restaurant-db', 1, (upgradeDb) => {

      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
      }

    });
  }

  static getRestaurantsFromCache() {
    return DBHelper.openDatabase()
      .then((db) => {
        let transaction = db.transaction('restaurants', 'readonly');
        let store = transaction.objectStore('restaurants');
        return store.getAll();
      });
  }

  static addRestaurantsToCache(restaurants) {
    return DBHelper.openDatabase()
      .then((db) => {
        let transaction = db.transaction('restaurants', 'readwrite');
        let store = transaction.objectStore('restaurants');
        restaurants.forEach(restaurant => store.put(restaurant));
      });
  }

  /**
   * Get all restaurants.
   */
  static getRestaurants(callback) {

    DBHelper.getRestaurantsPromise()
      .then((restaurants) => { callback(null, restaurants) })
      .catch((error) => { callback(error, null) });
  }

  /**
   * Get a promise for all the restaurants. Will attempt to retrieve from cache first.
   * Will always fetch from the server and update the cache.
   * @returns {Promise}
   */
  static getRestaurantsPromise() {

    // If the promise to get the restaurants already exists then reuse it. In doing so
    // we ensure that the data is only retrieved from the cache and the server once
    // regardless of the number of function calls made.
    if (restaurantsPromise) {
      return restaurantsPromise;
    }

    restaurantsPromise = new Promise(function (resolve, reject) {

      DBHelper.getRestaurantsFromCache()
        .then((restaurants) => {

          let restaurantsInCache = restaurants.length > 0;

          // If the restaurants were in the cache then return them before fetching from the
          // server. After we fetch from the server we will update the cache.
          if (restaurantsInCache) {
            resolve(restaurants);
          }

          fetch(DBHelper.SERVER_URL)
            .then((response) => {

              if (response.status === 200) {
                response.json().then(function (restaurants) {

                  DBHelper.addRestaurantsToCache(restaurants); // Ensure the restaurants cache is always updated

                  if (!restaurantsInCache) { // If restaurants weren't returned from cache, return them now
                    resolve(restaurants);
                  }

                });
              } else { // Oh no... Houston we have a problem.

                if (restaurantsInCache) { // If restaurants were returned from cache, ignore server error
                  return;
                }

                const error = (`Request failed. Returned status of ${response.status}`);
                reject(error);
              }

            }).catch((err) => {

              if (restaurantsInCache) { // If restaurants were returned from cache, ignore error
                return;
              }

              const error = (`An error occurred. Error: ${err}`);
              reject(error);
          });
        });
    });

    return restaurantsPromise;
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.getRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.getRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.getRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.getRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.getRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.getRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant lightweight placehold image URL.
   */
  static imagePlaceholderUrlForRestaurant(restaurant) {
    return (`/img-export/${restaurant.id}_placeholder.jpg`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img-export/${restaurant.id}.jpg`);
  }

  /**
   * Get the image widths and URLs for all the sized versions of the restaurant image
   * @param restaurant
   * @returns {Array} - Array of objects with width and url properties
   */
  static allRestaurantImageSizesDetails(restaurant) {

    const filenameWithoutExtension = restaurant.id;
    let allSizedImages = [];

    allSizedImages.push({width: 200, url: `/img-export/${filenameWithoutExtension}_200.jpg`});
    allSizedImages.push({width: 400, url: `/img-export/${filenameWithoutExtension}_400.jpg`});
    allSizedImages.push({width: 800, url: `/img-export/${filenameWithoutExtension}.jpg`}); // The original is 800px

    return allSizedImages;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP
      }
    );
    return marker;
  }

}
