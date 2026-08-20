const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'get-network-quality-html.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function getNetworkQualityHTML()',
  'navigator.connection || navigator.mozConnection || navigator.webkitConnection',
  'let bars = 3',
  "conn.effectiveType === '4g'",
  "conn.effectiveType === '3g'",
  "conn.effectiveType === '2g'",
  "let html = '<div style=\"display:flex;align-items:flex-end;gap:2px;height:12px\">'",
  'for(let i=1;i<=4;i++)',
  'const active = i <= bars',
  'network-bar-active',
  'return html'
]) {
  assert(source.includes(marker), `Network quality HTML marker missing: ${marker}`);
}
assert(html.includes('src/features/get-network-quality-html.js'), 'Network quality HTML module must remain linked from HTML');
assert(!source.includes('fetch('), 'Network quality HTML must not own network requests');
assert(!source.includes('supabase'), 'Network quality HTML must not own remote data access');
assert.strictEqual((source.match(/function getNetworkQualityHTML\(/g) || []).length, 1, 'Network quality HTML must have one module owner');

console.log('GET_NETWORK_QUALITY_HTML_CONTRACT_HARNESS=PASS');
console.log('CONNECTION_MAPPING_DEFAULT_FOUR_BARS_CALL_UI_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/get-network-quality-html.js');
console.log('PRODUCTION_CHANGE=0');
