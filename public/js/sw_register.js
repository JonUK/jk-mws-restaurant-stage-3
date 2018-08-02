
if ('serviceWorker' in navigator) {

  console.info('Congratulations, you are running a modern browser so we can use a service worker.');

  if ('SyncManager' in window) {
    console.info('Your browser also supports background sync!');
  }

  // We won't register the service worker till after the current page has loaded. We don't want our
  // service worker which can make multiple fetch requests to impact the current page load.
  window.addEventListener('load', function() {

    navigator.serviceWorker.register('/sw.js')
      .then(() => console.info('The service worker registration succeeded'))
      .catch((error) => console.error('The service worker registration failed with ' + error));
  });
}

