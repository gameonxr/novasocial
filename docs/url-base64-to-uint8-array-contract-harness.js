const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'url-base64-to-uint8-array.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const pushSubscriptionOwnerSource = fs.readFileSync(path.join(repo, 'src', 'features', 'push-subscription-owner.js'), 'utf8');

for (const marker of [
  'function urlBase64ToUint8Array(base64String)',
  "'='.repeat((4 - base64String.length % 4) % 4)",
  ".replace(/-/g, '+').replace(/_/g, '/')",
  'window.atob(base64)',
  'new Uint8Array(rawData.length)',
  'rawData.charCodeAt(i)'
]) {
  assert(source.includes(marker), `URL Base64 helper marker missing: ${marker}`);
}
assert(pushSubscriptionOwnerSource.includes('urlBase64ToUint8Array(VAPID_PUBLIC_KEY)'), 'Push subscription must use the URL Base64 helper');
assert(!source.includes('fetch('), 'URL Base64 helper must not own network requests');
assert(!source.includes('subscribe('), 'URL Base64 helper must not own push subscription orchestration');
assert(!source.includes('Notification.requestPermission'), 'URL Base64 helper must not own permission prompts');
assert.strictEqual((source.match(/function urlBase64ToUint8Array\(/g) || []).length, 1, 'URL Base64 helper must have one module owner');

console.log('URL_BASE64_TO_UINT8_ARRAY_CONTRACT_HARNESS=PASS');
console.log('PADDING_ALPHABET_DECODE_TYPED_ARRAY_BYTE_COPY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/url-base64-to-uint8-array.js');
console.log('PRODUCTION_CHANGE=0');
