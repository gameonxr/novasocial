const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const files = ['index.html', 'src/features/profile.js', 'src/features/home.js'];
const counts = {};
for (const relative of files) {
  const text = fs.readFileSync(path.join(repo, relative), 'utf8');
  counts[relative] = (text.match(/throw\s+new\s+Error\s*\(/g) || []).length;
}
assert.deepStrictEqual(counts, {
  'index.html': 8,
  'src/features/profile.js': 2,
  'src/features/home.js': 2,
}, 'explicit error boundaries must retain their exact per-file counts');

const candidates = ['sw.js', 'manifest.json', ...fs.readdirSync(path.join(repo, 'src'), { recursive: true }).filter(file => String(file).endsWith('.js')).map(file => path.join('src', file))];
const unexpected = [];
for (const relative of candidates) {
  if (files.includes(relative)) continue;
  const text = fs.readFileSync(path.join(repo, relative), 'utf8');
  if (/throw\s+new\s+Error\s*\(/.test(text)) unexpected.push(relative);
}
assert.deepStrictEqual(unexpected, [], `unexpected explicit error boundaries: ${unexpected.join(', ')}`);
const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
assert.strictEqual(total, 12, 'exactly twelve explicit error boundaries must remain');
console.log('EXPLICIT_ERROR_BOUNDARY_HARNESS=PASS');
console.log(`TOTAL_BOUNDARIES=${total}`);
console.log('PER_FILE=index.html:8,src/features/profile.js:2,src/features/home.js:2');
console.log('UNEXPECTED_BOUNDARIES=0');
