const CACHE_NAME = 'notes-app-cache-v1';

// Liste aller Dateien, die für die Offline-Nutzung gecached werden sollen.
// Stelle sicher, dass diese Liste alle kritischen Assets enthält.
const urlsToCache = [
    '/', // Wichtig für GitHub Pages (Root der Anwendung)
    'index.html', 
    'manifest.json',
    'icon-512.png', // Aus deiner HTML-Datei 
    
    // Gecachte externe Abhängigkeiten (sehr wichtig für Offline)
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
    // Fonts werden oft aufgrund von CORS und Redirects vom Browser selbst verwaltet, 
    // aber das Hinzufügen der Haupt-CSS ist essentiell.
];

// ** INSTALLATION **
// Cache statische Dateien
self.addEventListener('install', event => {
    // self.skipWaiting() stellt sicher, dass der neue SW sofort die Kontrolle übernimmt
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// ** AKTIVIERUNG **
// Löscht alte Caches, um Platz zu schaffen und Veralterung zu verhindern
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
        })
    );
});

// ** FETCH **
// Stellt gecachte Inhalte bereit, wenn die App offline ist (Cache-First-Strategie)
self.addEventListener('fetch', event => {
    // Nur GET-Anfragen bearbeiten
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Gibt die gecachte Antwort zurück, wenn vorhanden
                if (response) {
                    return response;
                }
                
                // Falls nicht im Cache, gehe zum Netzwerk
                return fetch(event.request);
            })
    );
});