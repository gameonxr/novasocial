'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const refs = [];
const pattern = /\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/g;
let match;
while ((match = pattern.exec(html))) {
  const ref = match[1];
  if (ref.includes('${') || ref.startsWith('$') || /^(?:data:|javascript:|#|mailto:)/.test(ref)) continue;
  if (/^(?:[A-Za-z][A-Za-z0-9+.-]*:|\/\/)/.test(ref)) continue;
  const parsed = new URL(ref, 'https://novasocial.local/');
  const relative = parsed.pathname.replace(/^\//, '');
  if (!relative) continue;
  refs.push({ ref, relative });
}
const unique = [...new Map(refs.map(item => [item.ref, item])).values()];
const missing = unique.filter(item => !fs.existsSync(path.join(repo, item.relative))).map(item => item.ref).sort();

assert.strictEqual(unique.length, 271, 'static local asset-reference inventory must reflect the cleanup-expired-story-media owner script addition');
assert.deepStrictEqual(missing, [], 'every static local asset reference must resolve');
assert(fs.existsSync(path.join(repo, 'manifest.json')), 'root manifest must remain available');
assert(fs.existsSync(path.join(repo, 'sw.js')), 'service worker must remain available');

console.log('LOCAL_HTML_ASSET_REFERENCE_HARNESS=PASS');
console.log(`STATIC_LOCAL_REFS=${unique.length}`);
console.log('MISSING_REFS=0');
