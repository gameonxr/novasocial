const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const utils = fs.readFileSync(path.join(repo, 'src', 'core', 'utils.js'), 'utf8');
assert.strictEqual((utils.match(/function esc\(/g) || []).length, 1, 'esc must have exactly one shared definition');
const start = utils.indexOf('function esc(');
const end = utils.indexOf('\nfunction ico', start);
assert(start >= 0 && end > start, 'esc function boundary must remain extractable');
const context = {};
vm.createContext(context);
vm.runInContext(utils.slice(start, end), context, { filename: 'utils.js:esc' });
assert.strictEqual(context.esc(null), '', 'esc(null) must return empty string');
assert.strictEqual(context.esc(undefined), '', 'esc(undefined) must return empty string');
assert.strictEqual(context.esc(42), '42', 'esc must stringify numbers');
assert.strictEqual(context.esc(false), 'false', 'esc must stringify booleans');
assert.strictEqual(context.esc('&<>"\''), '&amp;&lt;&gt;&quot;&#39;', 'esc must preserve the established HTML entities');
assert.strictEqual(context.esc('safe text'), 'safe text', 'esc must preserve ordinary text');

console.log('ESCAPE_HELPER_HARNESS=PASS');
console.log('SHARED_DEFINITION=1');
console.log('NULLISH_HANDLING=PASS');
console.log('STRINGIFICATION=PASS');
console.log('SPECIAL_CHARACTER_ESCAPING=PASS');
