'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
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
assert.strictEqual(files.length, 371, 'index.html plus 240 extracted scripts must be audited after the DMs renderer split');
assert.strictEqual(seen.size, 559, 'top-level function inventory must reflect the adminApproveBan owner extraction');
assert.deepStrictEqual(duplicates, [], 'classic scripts must not duplicate top-level function names');

console.log('CROSS_MODULE_FUNCTION_COLLISION_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log(`TOP_LEVEL_FUNCTION_NAMES=${seen.size}`);
console.log('DUPLICATE_NAMES=0');
