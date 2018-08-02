let restaurant;
var map;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initPage();
});

/**
 * Initialize page including populate HTML and setup map
 */
initPage = () => {

  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
      return;
    }

    fillRestaurantHTML(restaurant);

    if (typeof L === 'undefined') {
      return; // If the Leaflet library has not been loaded / offline the don't show the map
    }

    self.map = L.map('details-map', {
      center: [restaurant.latlng.lat, restaurant.latlng.lng],
      zoom: 16,
      scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: 'pk.eyJ1Ijoiam9udWsiLCJhIjoiY2lwMDdzNmdnMDBnOXZrbTJma3kzb2p1NyJ9.g3Zq43sZlQw8oz07ZAZc6w',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(map);


    DBHelper.mapMarkerForRestaurant(restaurant, self.map);

  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {

  const idString = getParameterByName('id');

  if (!idString) { // No id found in URL
    let error = 'No restaurant id in URL';
    callback(error, null);
    return;
  }

  const id = parseInt(idString, 10);

  DBHelper.fetchRestaurantById(id, (error, restaurant) => {
    if (!restaurant) {
      console.error(error);
      return;
    }

    callback(null, restaurant)
  });

};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant) => {

  fillBreadcrumb(restaurant);

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  const title = document.createElement('h3');
  title.innerHTML = 'Address';
  address.appendChild(title);
  address.appendChild(document.createTextNode(restaurant.address));

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name;

  image.addEventListener('load', function () {

    if (typeof L === 'undefined') {
      return; // If the Leaflet library has not been loaded / offline the use the map
    }

    // Once the image has loaded, we then know the space available for the map so re-evaluate the size
    map.invalidateSize();
  });

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  }

  // fill reviews
  fillReviewsHTML(restaurant.reviews);

  setupReviewForm(restaurant.id);

};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  if (reviews.length === 0) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'Unable to display reviews at this time!';
    container.appendChild(noReviews);
    return;
  }

  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};


/**
 * Add an additional review to the end of the review list
 */
addAdditionalReviewHtml = (review) => {
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  if (review.createdAt) {
    let createdDate = new Date(review.createdAt);
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateString = createdDate.toLocaleDateString('en-GB', options);

    const date = document.createElement('p');
    date.innerHTML = dateString;
    li.appendChild(date);
  }

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

setupReviewForm = (id) => {

  let reviewForm = document.getElementById('review-form');

  reviewForm.addEventListener('submit', (event) => {

    event.preventDefault();

    // First check that the form has been fully completed
    let checkedReviewRatingValue = document.querySelector('input[name="review-rating"]:checked').value;
    let reviewerNameValue = document.getElementById('reviewer-name').value.trim();
    let reviewCommentsValue = document.getElementById('review-comments').value.trim();
    let formNotFullyComplete = checkedReviewRatingValue === "0" || !reviewerNameValue || !reviewCommentsValue;

    if (formNotFullyComplete) {
      let validationErrorElement = document.getElementById('review-form-validation-error');
      validationErrorElement.style.display = 'block';
      return;
    }

    let unixEpochMilliseconds = (new Date).getTime();
    let ratingNumber = parseInt(checkedReviewRatingValue, 10);

    // Temporary code to submit the review to the server. Will be change to be
    // sent via the service worker later with a background sync.
    let newRestaurantReview = {
      "restaurant_id": id,
      "name": reviewerNameValue,
      "createdAt": unixEpochMilliseconds,
      "updatedAt": unixEpochMilliseconds,
      "rating": ratingNumber,
      "comments": reviewCommentsValue
    };


    DBHelper.addRestaurantReviewToSyncCache(newRestaurantReview)
      .then(() => {

        // Once the review is in the sync cache, request a sync to the server
        navigator.serviceWorker.ready.then(function(sw) {
          return sw.sync.register('reviews-sync');
        });

        // Display the review and thank the user for their time
        let reviewFormContent = document.getElementById('review-form-content');
        let reviewFormComplete = document.getElementById('review-form-complete');
        reviewFormContent.style.display = 'none';
        reviewFormComplete.style.display = 'block';

        addAdditionalReviewHtml(newRestaurantReview)
      });
  });
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
