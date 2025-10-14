const CACHE_NAME = 'getdailyoffer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/android-launchericon-192-192.png',
  '/assets/icons/android-launchericon-512-512.png'
];

// Install and cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - differentiate between static and dynamic assets
self.addEventListener('fetch', event => {
  // Handle fetch for script.js with a network-first strategy
  if (event.request.url.includes('script.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Optional: Cache the new version of the script after fetching it
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request)) // Fallback to cache if network fails
    );
  } else {
    // For other assets (like HTML, CSS, images), use cache-first strategy
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

// Remove old caches during activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)  // Delete old caches
          .map(key => caches.delete(key))
      )
    )
  );
});
