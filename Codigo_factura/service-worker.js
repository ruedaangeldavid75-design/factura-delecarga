const CACHE_NAME = 'delecarga-v1';

const urlsToCache = [
  './',
  './index.html',
  './estilo.css',
  './script.js',
  './img/imagen_logo_delecarga.png'
];

// Instalar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activar
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim())
});

// Fetch (offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});