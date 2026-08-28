'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
function count(pattern) {
  return (html.match(pattern) || []).length;
}

assert(html.trimStart().toLowerCase().startsWith('<!doctype html>'), 'index.html must retain its HTML5 doctype');
assert.strictEqual(count(/<script\b/gi), 230, 'index.html must retain 230 script tags after the DMs renderer split');
assert.strictEqual(count(/<\/script>/gi), 230, 'every script tag must be closed after the DMs renderer split');
assert.strictEqual(count(/<script\s+src=/gi), 229, '229 extracted/external script tags must remain integrated');
assert.strictEqual(count(/<script(?:\s[^>]*)?>/gi) - count(/<script\s+src=/gi), 1, 'one inline application script must remain');
assert.strictEqual(count(/<body\b/gi), 1, 'one body element must remain');
assert.strictEqual(count(/<\/body>/gi), 1, 'body element must close once');
assert.strictEqual(count(/<html\b/gi), 1, 'one html element must remain');
assert.strictEqual(count(/<\/html>/gi), 1, 'html element must close once');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(html.includes('function renderReels('), 'protected Reels renderer must remain inline');

console.log('INDEX_HTML_TAG_INTEGRITY_HARNESS=PASS');
console.log('SCRIPT_TAGS=230');
console.log('SCRIPT_CLOSURES=230');
console.log('EXTERNAL_SCRIPT_TAGS=229');
console.log('INLINE_SCRIPT_TAGS=1');
