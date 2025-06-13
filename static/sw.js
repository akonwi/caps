const CACHE_NAME = 'caps-v1';
const STATIC_ASSETS = [
	'/',
	'/manifest.json',
	'/icon-192.png',
	'/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
	self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});

// Push notification event
self.addEventListener('push', (event) => {
	let data = {};
	
	if (event.data) {
		try {
			data = event.data.json();
		} catch (e) {
			data = { title: 'Caps', body: 'Time to pick today\'s hat!' };
		}
	}

	const options = {
		body: data.body || 'Time to pick today\'s hat!',
		icon: data.icon || '/icon-192.png',
		badge: '/icon-192.png',
		data: data.data || {},
		actions: [
			{
				action: 'open',
				title: 'Pick Hat'
			}
		],
		requireInteraction: true,
		tag: 'daily-hat'
	};

	// Add image if available
	if (data.image) {
		options.image = data.image;
	}

	event.waitUntil(
		self.registration.showNotification(data.title || 'Caps', options)
	);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'open' || !event.action) {
		event.waitUntil(
			clients.matchAll({ type: 'window' }).then((clientList) => {
				// If app is already open, focus it
				for (const client of clientList) {
					if (client.url === '/' && 'focus' in client) {
						return client.focus();
					}
				}
				// Otherwise open new window
				return clients.openWindow('/');
			})
		);
	}
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
	if (event.tag === 'background-sync') {
		event.waitUntil(doBackgroundSync());
	}
});

async function doBackgroundSync() {
	// Placeholder for syncing data when connection is restored
	console.log('Background sync triggered');
}
