const CACHE_NAME = 'voyage-checklist-v2';
const ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// CACHE FIRST — offline guaranteed
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) {
        fetch(e.request).then(function(r) {
          if (r && r.status === 200) {
            caches.open(CACHE_NAME).then(function(c) { c.put(e.request, r); });
          }
        }).catch(function() {});
        return cached;
      }
      return fetch(e.request).then(function(r) {
        if (r && r.status === 200) {
          var clone = r.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return r;
      }).catch(function() {
        return new Response('Hors ligne', {status: 503});
      });
    })
  );
});
