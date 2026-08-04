// ═══════════════════════════════════════════════════════════════
// NovaSocial Service Worker
// Phase 0: install/activate + basic offline cache
// Phase 3: push event handler + notificationclick handler
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'novasocial-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-180.png',
  '/manifest.json'
];

// ─── PHASE 0: install + activate + basic fetch caching ──────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  // Skip cross-origin requests (Cloudinary, Supabase, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Network-first for navigation requests (so users get fresh HTML when online),
      // fallback to cache when offline
      if (event.request.mode === 'navigate') {
        return fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
            return response;
          })
          .catch(() => cached || caches.match('/'));
      }
      // Cache-first for other assets
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      }).catch(() => cached);
    })
  );
});

// ─── PHASE 3: push event handler ────────────────────────────────────
// Receives a push message from the push service (FCM/APNs/etc.) and
// displays a system notification. The push payload is expected to be JSON
// with any of: title, body, icon, badge, image, url, notificationType, tag.
//
// Payload schema (set by Phase 4's Edge Function — not built yet):
//   {
//     title: "John liked your post",
//     body: "🔥 Check out their reaction",
//     icon: "/icon-192.png",                   // optional
//     image: "https://res.cloudinary.com/...", // optional — post thumbnail
//     url: "/?p=<postId>",                     // deep link — tapped notification opens here
//     notificationType: "like",                // for analytics / categorization
//     tag: "post-<postId>"                     // optional — same tag replaces prev notif (no stacking)
//   }
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // Payload wasn't valid JSON — fall back to text or a generic message
    data = { title: 'NovaSocial', body: event.data ? event.data.text() : 'New notification' };
  }

  const title = data.title || 'NovaSocial';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',          // root-relative path — matches manifest.json registration scope
    badge: data.badge || '/icon-192.png',        // small monochrome badge — same file as fallback
    image: data.image || undefined,              // optional large image (e.g. liked post's thumbnail)
    data: {
      url: data.url || '/',                      // deep-link target — e.g. "/?p=<postId>"
      notificationType: data.notificationType || 'general',
    },
    vibrate: [100, 50, 100],
    tag: data.tag || undefined,                  // same tag replaces prev notif instead of stacking
    renotify: !!data.tag,                        // re-alert the user if replacing a tagged notif
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── PHASE 3: notificationclick event handler ───────────────────────
// When the user taps a notification, open/focus the app and navigate to
// the deep-link URL stored in notification.data.url.
//
// Behavior:
//   - If the app is already open in a tab → focus it + navigate to targetUrl
//   - If no app tab is open → open a new window/tab at targetUrl
//
// The targetUrl is whatever the push payload included (e.g. "/?p=<postId>").
// The app's existing deep-link handler (processDeepLinks in the HTML) parses
// ?p=, ?u=, ?gc= query params and opens the right screen.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Prefer an app tab that's already controlled by this service worker
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Fall back to ANY app tab (even uncontrolled ones)
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // No existing tab — open a new one
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
