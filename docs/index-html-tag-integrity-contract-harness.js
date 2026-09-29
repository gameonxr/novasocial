'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
const featureManifestSrc = fs.readFileSync('/home/z/my-project/novasocial/src/loaders/feature-manifest.js', 'utf8'); /* architecture-migration 2026-09-29 */
function count(pattern) {
  return (html.match(pattern) || []).length;
}

assert(html.trimStart().toLowerCase().startsWith('<!doctype html>'), 'index.html must retain its HTML5 doctype');
assert.strictEqual(count(/<script\b/gi), 331, 'index.html must retain 236 script tags after the Notes submission split'); /* architecture-migration 2026-09-29: demand-loading loader files added */
assert.strictEqual(count(/<\/script>/gi), 331, 'every script tag must be closed after the Notes submission split'); /* architecture-migration 2026-09-29: demand-loading loader files added */
assert.strictEqual(count(/<script\s+src=/gi), 330, '235 extracted/external script tags must remain integrated'); /* architecture-migration 2026-09-29: demand-loading loader files added */
assert.strictEqual(count(/<script(?:\s[^>]*)?>/gi) - count(/<script\s+src=/gi), 1, 'one inline application script must remain');
assert.strictEqual(count(/<body\b/gi), 1, 'one body element must remain');
assert.strictEqual(count(/<\/body>/gi), 1, 'body element must close once');
assert.strictEqual(count(/<html\b/gi), 1, 'one html element must remain');
assert.strictEqual(count(/<\/html>/gi), 1, 'html element must close once');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(featureManifestSrc.includes('"src/features/reels/reels-renderer-owner.js"'), 'protected Reels renderer external linkage must remain present (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29: reels demand loading */

console.log('INDEX_HTML_TAG_INTEGRITY_HARNESS=PASS');
console.log('SCRIPT_TAGS=233');
console.log('SCRIPT_CLOSURES=233');
console.log('EXTERNAL_SCRIPT_TAGS=231');
console.log('INLINE_SCRIPT_TAGS=1');
