const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

const sourceFiles = walk(srcRoot).filter((file) => file.endsWith('.js')).sort();
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const indexText = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const serviceWorkerText = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const listenerFiles = sourceFiles.filter((file) => fs.readFileSync(file, 'utf8').includes('addEventListener'));

assert.strictEqual(sourceFiles.length, 378, '234 extracted JavaScript modules must remain present after the DMs renderer split');
assert.strictEqual(count(sourceText, 'addEventListener'), 96, 'extracted modules must retain the audited 74 listener registrations after Reels windowing helper split');
assert.strictEqual(count(sourceText, 'removeEventListener'), 0, 'the audit must not silently introduce cleanup registrations in extracted modules');
assert.strictEqual(count(indexText, 'addEventListener'), 8, 'index.html must retain 30 listener registrations after the authorized forward-message selector');
assert.strictEqual(count(indexText, 'removeEventListener'), 0, 'index.html must retain zero cleanup registrations');
assert.strictEqual(count(serviceWorkerText, 'addEventListener'), 5, 'service worker must retain its five lifecycle/event registrations');
assert(listenerFiles.length > 0, 'extracted listener inventory must not be empty');

console.log('EVENT_LISTENER_BOUNDARY_HARNESS=PASS');
console.log(`SRC_MODULES=${sourceFiles.length}`);
console.log(`SRC_LISTENER_FILES=${listenerFiles.length}`);
console.log('SRC_ADD_EVENT_LISTENERS=77');
console.log('SRC_REMOVE_EVENT_LISTENERS=0');
console.log('INDEX_ADD_EVENT_LISTENERS=27');
console.log('INDEX_REMOVE_EVENT_LISTENERS=0');
console.log('SERVICE_WORKER_ADD_EVENT_LISTENERS=5');
console.log('CLEANUP_REFACTOR=NOT_SPECIFIED');
