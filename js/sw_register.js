
if ('serviceWorker' in navigator) {

  console.log('Congratulations, you are running a modern browser so we can use a service worker.');

  // Refresher article: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

  // ----------------------------------------------------------------------------------------------------
  // We won't register the service worker till after the current page has loaded. We don't want our
  // service worker which can make multiple fetch requests to impact the current page load.
  // ----------------------------------------------------------------------------------------------------
  window.addEventListener('load', function() {

    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('The service worker registration succeeded'))
      .catch((error) => console.log('The service worker registration failed with ' + error));
  });
}

