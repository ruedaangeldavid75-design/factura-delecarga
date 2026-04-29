const CACHE_NAME = 'delecarga-v2';
const urlsToCache = [
    './',
    './index.html',
    './estilo.css',
    './script.js',
    './manifest.json',
    './img/imagen_logo_delecarga.png',
    './img/fecha_servicio.png',
    './img/imagen_circular_recortada_ubicacion_dos.png',
    './img/imagen_circular_recortada_ubicacion_tres.png',
    './img/carro_delecarga.png',
    './img/descripcion_del_servicio.png',
    './img/imagen_circular_recortada_dinero_uno.png',
    './img/imagen_circular_recortada_dinero_dos.png',
    './img/imagen_circular_recortada_dineros.png',
    './img/imagen_circular_recortada_estrechomanos.png',
    './img/telefono.png',
    './img/logo whattaspts.png',
    './img/imagen_circular_recortada_proteccion.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});