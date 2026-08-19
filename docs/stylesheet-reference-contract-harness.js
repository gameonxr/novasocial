'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const styles = fs.readdirSync(path.join(repo, 'src/styles')).filter(name => name.endsWith('.css')).sort();

assert.strictEqual(styles.length, 18, 'all 18 extracted stylesheets must remain present');
const missing = [];
const duplicates = [];
for (const name of styles) {
  const marker = `<link rel="stylesheet" href="src/styles/${name}">`;
  const occurrences = html.split(marker).length - 1;
  if (occurrences === 0) missing.push(name);
  if (occurrences > 1) duplicates.push(`${name}:${occurrences}`);
}
assert.deepStrictEqual(missing, [], 'no extracted stylesheet may be unreferenced');
assert.deepStrictEqual(duplicates, [], 'no extracted stylesheet may be linked more than once');
assert(html.includes('function renderDMs('), 'protected DMs renderer must remain inline');
assert(html.includes('function renderReels('), 'protected Reels renderer must remain inline');

console.log('STYLESHEET_REFERENCE_HARNESS=PASS');
console.log(`STYLESHEETS=${styles.length}`);
console.log('MISSING=0');
console.log('DUPLICATES=0');
