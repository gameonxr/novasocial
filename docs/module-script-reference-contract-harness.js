'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const moduleDirs = ['src/core', 'src/components', 'src/features'];
const modules = moduleDirs.flatMap(dir => fs.readdirSync(path.join(repo, dir)).filter(name => name.endsWith('.js')).map(name => `${dir}/${name}`)).sort();

assert.strictEqual(modules.length, 452, 'all 234 extracted JavaScript modules must remain present after the DMs renderer split');

const missing = [];
const duplicates = [];
for (const modulePath of modules) {
  const marker = `<script src="${modulePath}"></script>`;
  const occurrences = html.split(marker).length - 1;
  if (occurrences === 0) missing.push(modulePath);
  if (occurrences > 1) duplicates.push(`${modulePath}:${occurrences}`);
}
assert.deepStrictEqual(missing, [], 'no extracted JavaScript module may be unreferenced');
assert.deepStrictEqual(duplicates, [], 'no extracted JavaScript module may be loaded more than once');

const corePositions = modules.filter(modulePath => modulePath.startsWith('src/core/')).map(modulePath => html.indexOf(`<script src="${modulePath}"></script>`));
const inlinePosition = html.indexOf('<script>');
assert(corePositions.every(position => position >= 0 && position < inlinePosition), 'all core modules must load before inline application code');

const trailing = ['nova-init.js', 'spawn-like-particles.js', 'sync-local-deletion-fallback.js', 'push-settings.js', 'note-reactors-list-owner.js', 'note-viewer-owners.js', 'note-deletion-owner.js', 'story-editor-owners.js', 'reels-video-windowing.js', 'like-effects.js'].map(name => html.lastIndexOf(`<script src="src/features/${name}"></script>`));
assert(trailing.every(position => position >= 0), 'required trailing script references must remain present');
assert(trailing.every((position, index) => index === 0 || trailing[index - 1] < position), 'required trailing script order must remain unchanged');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(html.includes('<script src="src/features/reels-renderer-owner.js"></script>'), 'protected Reels renderer external linkage must remain present');

console.log('MODULE_SCRIPT_REFERENCE_HARNESS=PASS');
console.log(`MODULES=${modules.length}`);
console.log('MISSING=0');
console.log('DUPLICATES=0');
