// AyurCare Service Worker
// sw.js - Progressive Web App functionality

const CACHE_NAME = 'ayurcare-v1.0.0';
const STATIC_CACHE = 'ayurcare-static-v1.0.0';
const DYNAMIC_CACHE = 'ayurcare-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/enhancements.css',
    '/script.js',
    '/enhancements.js',
    '/translations.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    // External resources that should be cached
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets:', error);
            })
    );
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') return;

    // Handle API requests differently
    if (url.hostname.includes('generativelanguage.googleapis.com')) {
        // For Gemini API, try network first, then cache
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached response if available
                    return caches.match(request);
                })
        );
        return;
    }

    // For all other requests, try cache first, then network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response.ok) {
                            return response;
                        }

                        // Cache the response
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed:', error);

                        // Return offline fallback for HTML pages
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }

                        // For other requests, return a basic offline response
                        return new Response('Offline content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle any pending offline actions here
            // For example, sync patient data when back online
            syncOfflineData()
        );
    }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received:', event);

    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked:', event);
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});

// Helper function for background sync
async function syncOfflineData() {
    try {
        // Get all pending offline actions from IndexedDB or similar
        // For now, this is a placeholder for future implementation
        console.log('Service Worker: Syncing offline data...');

        // Example: Sync patient data
        // const offlinePatients = await getOfflinePatients();
        // await syncPatientsToServer(offlinePatients);

    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
    }
}

// Periodic background tasks (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-reminder') {
        event.waitUntil(
            // Send daily health reminders or check for updates
            sendDailyReminder()
        );
    }
});

async function sendDailyReminder() {
    try {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'daily-reminder',
                message: 'Remember to check your Ayurvedic routine today!'
            });
        });
    } catch (error) {
        console.error('Service Worker: Daily reminder failed:', error);
    }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);

    if (event.data && event.data.type === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'getCacheInfo') {
        caches.keys().then((cacheNames) => {
            event.ports[0].postMessage({
                cacheNames: cacheNames,
                cacheName: CACHE_NAME
            });
        });
    }
});
