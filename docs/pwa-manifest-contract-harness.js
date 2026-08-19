const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const manifestPath = path.join(repo, 'manifest.json');
const htmlPath = path.join(repo, 'index.html');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const html = fs.readFileSync(htmlPath, 'utf8');

assert.strictEqual(manifest.name, 'NovaSocial', 'manifest name must remain NovaSocial');
assert.strictEqual(manifest.short_name, 'NovaSocial', 'manifest short_name must remain NovaSocial');
assert.strictEqual(manifest.start_url, '/', 'manifest start_url must remain root-relative');
assert.strictEqual(manifest.scope, '/', 'manifest scope must remain root-relative');
assert.strictEqual(manifest.display, 'standalone', 'manifest display must remain standalone');
assert.strictEqual(manifest.orientation, 'portrait', 'manifest orientation must remain portrait');
assert.strictEqual(manifest.theme_color, '#E1306C', 'manifest theme color must remain NovaSocial pink');
assert.strictEqual(manifest.background_color, '#000000', 'manifest background color must remain black');

assert(Array.isArray(manifest.icons), 'manifest icons must remain an array');
for (const expected of [
  { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
  { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
]) {
  const icon = manifest.icons.find((candidate) => candidate.src === expected.src);
  assert(icon, `manifest must reference ${expected.src}`);
  assert.strictEqual(icon.sizes, expected.sizes, `${expected.src} must retain ${expected.sizes} dimensions`);
  assert.strictEqual(icon.type, expected.type, `${expected.src} must remain a PNG icon`);
  assert(fs.existsSync(path.join(repo, expected.src)), `${expected.src} must exist in the repository`);
}

assert(/<link\s+rel=["']manifest["']\s+href=["']\/manifest\.json["']/i.test(html), 'index.html must link /manifest.json');
assert(/<meta\s+name=["']theme-color["']\s+content=["']#E1306C["']/i.test(html), 'index.html must retain the matching theme color');
assert(/<meta\s+name=["']apple-mobile-web-app-capable["']\s+content=["']yes["']/i.test(html), 'index.html must retain mobile web-app capability metadata');
assert(html.includes("navigator.serviceWorker.register('/sw.js')"), 'index.html must register the root service worker');

console.log('PWA_MANIFEST_CONTRACT_HARNESS=PASS');
console.log('MANIFEST_IDENTITY=NovaSocial');
console.log('MANIFEST_ICONS=2');
console.log('HTML_MANIFEST_LINK=PASS');
console.log('SERVICE_WORKER_REGISTRATION=PASS');
