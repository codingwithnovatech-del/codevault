var CACHE = 'codevault-v3';
var urls = ['/', '/index.html'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(urls); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(k) {
          if (k !== CACHE) { return caches.delete(k); }
        })
      );
    }).then(function() {
      return self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) { client.navigate(client.url); });
      });
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
