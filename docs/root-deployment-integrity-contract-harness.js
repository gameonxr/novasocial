const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
function readRoot(name) {
  const file = path.join(repo, name);
  assert(fs.existsSync(file), `${name} must exist`);
  const data = fs.readFileSync(file);
  assert(data.length > 0, `${name} must be non-empty`);
  return data;
}

const html = readRoot('index.html').toString('utf8');
const manifest = JSON.parse(readRoot('manifest.json').toString('utf8'));
readRoot('sw.js');
const expectedIcons = [['icon-180.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]];
for (const [name, dimension] of expectedIcons) {
  const bytes = readRoot(name);
  assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `${name} must have a PNG signature`);
  assert.strictEqual(bytes.readUInt32BE(16), dimension, `${name} must be ${dimension}px wide`);
  assert.strictEqual(bytes.readUInt32BE(20), dimension, `${name} must be ${dimension}px high`);
}

assert.strictEqual(manifest.start_url, '/', 'manifest start_url must remain root');
assert.strictEqual(manifest.scope, '/', 'manifest scope must remain root');
assert(html.includes('<link rel="manifest" href="/manifest.json">'), 'HTML must reference manifest.json');
assert(html.includes('href="icon-192.png"'), 'HTML must reference icon-192.png');
assert(html.includes('href="icon-180.png"'), 'HTML must reference icon-180.png');
assert(html.includes("navigator.serviceWorker.register('/sw.js')"), 'HTML must register /sw.js');

console.log('ROOT_DEPLOYMENT_INTEGRITY_HARNESS=PASS');
console.log('ROOT_FILES=7');
console.log('PNG_DIMENSIONS=180,192,512');
console.log('INTEGRATION_REFERENCES=4');
