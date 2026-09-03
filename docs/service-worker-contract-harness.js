const assert = require('assert');
const fs = require('fs');

const serviceWorker = fs.readFileSync('/home/z/my-project/novasocial/sw.js', 'utf8');

assert(serviceWorker.includes("const CACHE_NAME = 'novasocial-v1';"), 'service worker cache name must remain stable');
for (const url of ['/', '/index.html', '/icon-192.png', '/icon-180.png', '/manifest.json']) {
  assert(serviceWorker.includes(`'${url}'`), `service worker shell cache must include ${url}`);
}

assert(serviceWorker.includes("self.addEventListener('install'"), 'install handler must remain');
assert(serviceWorker.includes("self.addEventListener('activate'"), 'activate handler must remain');
assert(serviceWorker.includes('self.skipWaiting()'), 'install handler must retain skipWaiting');
assert(serviceWorker.includes('self.clients.claim()'), 'activate handler must retain clients.claim');

assert(serviceWorker.includes("if (event.request.method !== 'GET') return;"), 'non-GET requests must bypass the service worker');
assert(serviceWorker.includes('if (url.origin !== self.location.origin) return;'), 'cross-origin requests must bypass the service worker');
assert(serviceWorker.includes("if (event.request.mode === 'navigate')"), 'navigation requests must retain a dedicated branch');
assert(serviceWorker.includes("return fetch(event.request)"), 'navigation requests must remain network-first');
assert(serviceWorker.includes("return cached || fetch(event.request)"), 'non-navigation assets must remain cache-first');
assert(serviceWorker.includes(".catch(() => cached || caches.match('/'))"), 'navigation must fall back to cached shell content');

assert(serviceWorker.includes("self.addEventListener('push'"), 'push handler must remain');
assert(serviceWorker.includes('event.data.json()'), 'push handler must parse JSON payloads');
assert(serviceWorker.includes("event.data.text()"), 'push handler must retain text fallback');
assert(serviceWorker.includes('self.registration.showNotification(title, options)'), 'push handler must display a notification');
assert(serviceWorker.includes("data.url || '/'"), 'push notification must retain a root fallback URL');

assert(serviceWorker.includes("self.addEventListener('notificationclick'"), 'notificationclick handler must remain');
assert(serviceWorker.includes('event.notification.close()'), 'notificationclick must close the notification');
assert(serviceWorker.includes("clients.matchAll({ type: 'window', includeUncontrolled: true })"), 'notificationclick must inspect open app clients');
assert(serviceWorker.includes('client.focus()'), 'notificationclick must focus an existing client');
assert(serviceWorker.includes('client.navigate(targetUrl)'), 'notificationclick must navigate an existing client');
assert(serviceWorker.includes('clients.openWindow(targetUrl)'), 'notificationclick must open a new client when none exists');

assert(!/importScripts\s*\(|<script\b|src\/core|src\/features/.test(serviceWorker), 'service worker must remain isolated from application modules');

console.log('SERVICE_WORKER_CONTRACT_HARNESS=PASS');
console.log('CACHE_NAME=novasocial-v1');
console.log('SHELL_URLS=5');
console.log('LIFECYCLE_HANDLERS=2');
console.log('PUSH_HANDLERS=2');
console.log('APPLICATION_IMPORTS=0');
