'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29 */
const ids = [];
const tagPattern = /<[A-Za-z][^>]*\bid\s*=\s*["']([^"']+)["'][^>]*>/g;
let match;
while ((match = tagPattern.exec(html))) ids.push(match[1]);
const counts = new Map();
for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
const duplicates = [...counts.entries()].filter(([, count]) => count > 1);

assert.strictEqual(ids.length, 42, 'static HTML ID inventory must reflect the approved protected owner groups after the Reels renderer split');
assert.strictEqual(counts.size, 42, 'static HTML IDs must remain unique');
assert.deepStrictEqual(duplicates, [], 'static HTML markup must not duplicate element IDs');
assert(!html.includes('function createPeerConnection('), 'approved Calls/WebRTC peer owner must be absent from inline HTML');
assert(fs.readFileSync(path.join(repo, 'src', 'features', 'calls', 'create-peer-connection.js') /* architecture-migration 2026-09-29: calls folder */, 'utf8').includes('window.createPeerConnection = function createPeerConnection('), 'approved Calls/WebRTC peer module owner must remain present');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(featureManifestSrc.includes('"src/features/reels/reels-renderer-owner.js"'), 'protected Reels renderer external linkage must remain present (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29: reels demand loading */

console.log('STATIC_HTML_ID_HARNESS=PASS');
console.log(`STATIC_IDS=${ids.length}`);
console.log('DUPLICATE_STATIC_IDS=0');
console.log('DYNAMIC_CALL_IDS=PROTECTED_RUNTIME_MANAGED');
