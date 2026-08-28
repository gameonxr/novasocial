'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const ids = [];
const tagPattern = /<[A-Za-z][^>]*\bid\s*=\s*["']([^"']+)["'][^>]*>/g;
let match;
while ((match = tagPattern.exec(html))) ids.push(match[1]);
const counts = new Map();
for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
const duplicates = [...counts.entries()].filter(([, count]) => count > 1);

assert.strictEqual(ids.length, 150, 'static HTML ID inventory must reflect the approved protected owner groups after the Reels renderer split');
assert.strictEqual(counts.size, 150, 'static HTML IDs must remain unique');
assert.deepStrictEqual(duplicates, [], 'static HTML markup must not duplicate element IDs');
assert(html.includes('function createPeerConnection('), 'protected Calls/WebRTC implementation must remain inline');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(html.includes('<script src="src/features/reels-renderer-owner.js"></script>'), 'protected Reels renderer external linkage must remain present');

console.log('STATIC_HTML_ID_HARNESS=PASS');
console.log(`STATIC_IDS=${ids.length}`);
console.log('DUPLICATE_STATIC_IDS=0');
console.log('DYNAMIC_CALL_IDS=PROTECTED_RUNTIME_MANAGED');
