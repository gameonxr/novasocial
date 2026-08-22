'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const files = [path.join(repo, 'index.html')];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
}
collect(path.join(repo, 'src'));
const seen = new Map();
for (const file of files) {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
    const match = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(line);
    if (match) {
      const locations = seen.get(match[1]) || [];
      locations.push(`${path.relative(repo, file)}:${index + 1}`);
      seen.set(match[1], locations);
    }
  });
}
const duplicates = [...seen.entries()].filter(([, locations]) => locations.length > 1);
assert.strictEqual(files.length, 216, 'index.html plus 215 extracted scripts must be audited after Note viewer split');
assert.strictEqual(seen.size, 713, 'top-level function inventory must remain stable after the four approved protected owner groups');
assert.deepStrictEqual(duplicates, [], 'classic scripts must not duplicate top-level function names');

console.log('CROSS_MODULE_FUNCTION_COLLISION_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log(`TOP_LEVEL_FUNCTION_NAMES=${seen.size}`);
console.log('DUPLICATE_NAMES=0');
