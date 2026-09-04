'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const sourceRoot = path.join(repo, 'src');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
}
walk(sourceRoot);
files.sort();

assert.strictEqual(files.length, 449, 'all 268 extracted source files must remain present after the Push permission banner owner split');
const empty = files.filter(file => fs.statSync(file).size === 0).map(file => path.relative(repo, file));
const trailing = [];
for (const file of files) {
  const relative = path.relative(repo, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (/[ \t]$/.test(line)) trailing.push(`${relative}:${index + 1}`);
  });
}
assert.deepStrictEqual(empty, [], 'no extracted source file may be empty');
assert.deepStrictEqual(trailing, [], 'no extracted source line may have trailing whitespace');

console.log('EXTRACTED_FILE_HYGIENE_HARNESS=PASS');
console.log(`SOURCE_FILES=${files.length}`);
console.log('EMPTY_FILES=0');
console.log('TRAILING_WHITESPACE=0');
