
if ('serviceWorker' in navigator) {

  console.log('Congratulations, you are running a modern browser so we can use a service worker.');

  // Refresher article: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

  // ----------------------------------------------------------------------------------------------------
  // We won't register the service worker till after the current page has loaded. We don't want our
  // service which can make multiple fetch requests to impact the current page load.
  // ----------------------------------------------------------------------------------------------------
  window.addEventListener('load', function() {

    // navigator.serviceWorker.register('sw.js', {scope: '/'})
    //   .then(function(reg) {
    //     // registration worked
    //     console.log('Registration succeeded. Scope is ' + reg.scope);
    //   }).catch(function(error) {
    //   // registration failed
    //   console.log('Registration failed with ' + error);
    // });

    //navigator.serviceWorker.register('/service-worker.js');
  });
}
