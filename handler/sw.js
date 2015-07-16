// Service Worker

// The name of the cache in the client-side cache database.
var CACHE_NAME = 'my-site-cache-v1';

// The files we want to cache
var urlsToCache = [
  '/',
  '/index.js'
];

// Version number: 1
// (Increment this when the script changes, to force a reload.)
importScripts('webactions-polyfill.js');

// Set the callback for the install step
self.addEventListener('install', function(event) {
  // Perform install steps
  console.log('install');

  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    console.log('Opened cache');
    return cache.addAll(urlsToCache);
  }));
});

self.addEventListener('activate', function(event) {
  console.log('activate');
});

self.addEventListener('fetch', function(event) {
  console.log('fetch: ' + event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          console.log('cache hit: ' + event.request.url);
          return response;
        }

        console.log('cache miss: ' + event.request.url);
        return fetch(event.request.url);
      }
    )
  );
});

// XXX: The 'connect' and 'message' events on navigator.services are the
// currently spec'd way to receive events, but Chrome 45 does not implement this
// event model.
navigator.services.addEventListener('connect', function(event) {
  console.log('navigator.services: Received connect event for ' +
              event.targetURL + ' from ' + event.origin);
  event.respondWith({accept: true, name: 'the_connecter'})
      .then(port => port.postMessage('You are connected!'));
});

navigator.services.addEventListener('message', function(event) {
  console.log('navigator.services: Received message event:', event);
});

// The older version of the standard passes 'crossoriginconnect' and
// 'crossoriginmessage' events to the global object instead (Chrome's current
// implementation as of 45 does this). I don't know how to send messages back to
// the client in this model.
self.addEventListener('crossoriginconnect', function(event) {
  console.log('global: Received crossoriginconnection on self:', event);
  event.acceptConnection(true);
});

self.addEventListener('crossoriginmessage', function(event) {
  console.log('global: Received crossoriginmessage event:', event);
});
