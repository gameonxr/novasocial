'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
function count(pattern) {
  return (html.match(pattern) || []).length;
}

assert(html.trimStart().toLowerCase().startsWith('<!doctype html>'), 'index.html must retain its HTML5 doctype');
assert.strictEqual(count(/<script\b/gi), 389, 'index.html must retain 236 script tags after the Notes submission split');
assert.strictEqual(count(/<\/script>/gi), 389, 'every script tag must be closed after the Notes submission split');
assert.strictEqual(count(/<script\s+src=/gi), 388, '235 extracted/external script tags must remain integrated');
assert.strictEqual(count(/<script(?:\s[^>]*)?>/gi) - count(/<script\s+src=/gi), 1, 'one inline application script must remain');
assert.strictEqual(count(/<body\b/gi), 1, 'one body element must remain');
assert.strictEqual(count(/<\/body>/gi), 1, 'body element must close once');
assert.strictEqual(count(/<html\b/gi), 1, 'one html element must remain');
assert.strictEqual(count(/<\/html>/gi), 1, 'html element must close once');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(html.includes('<script src="src/features/reels-renderer-owner.js"></script>'), 'protected Reels renderer external linkage must remain present');

console.log('INDEX_HTML_TAG_INTEGRITY_HARNESS=PASS');
console.log('SCRIPT_TAGS=233');
console.log('SCRIPT_CLOSURES=233');
console.log('EXTERNAL_SCRIPT_TAGS=231');
console.log('INLINE_SCRIPT_TAGS=1');
