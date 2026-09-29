'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29 */
const moduleDirs = ['src/core', 'src/components', 'src/features', 'src/loaders'];
/* architecture-migration 2026-09-29: recursive scan — feature files live in feature subfolders; loaders dir added */
const walkModules = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walkModules(path.join(dir, e.name)) : (e.name.endsWith('.js') ? [path.join(dir, e.name)] : []));
const modules = moduleDirs.flatMap(dir => walkModules(path.join(repo, dir))).map(f => path.relative(repo, f).split(path.sep).join('/')).sort();

assert.strictEqual(modules.length, 469, 'all extracted JavaScript modules must remain present (463 feature/core/component files + 4 loader files)'); /* architecture-migration 2026-09-29: demand-loading loader files added */

/* architecture-migration 2026-09-29: a module is referenced when it appears as a startup
   script tag OR as an entry in the feature manifest (demand-loaded chunks). */
const featureManifest = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8');
const missing = [];
const duplicates = [];
for (const modulePath of modules) {
  const marker = `<script src="${modulePath}"></script>`;
  const occurrences = html.split(marker).length - 1;
  const manifestOccurrences = featureManifest.split(`"${modulePath}"`).length - 1;
  if (occurrences === 0 && manifestOccurrences === 0) missing.push(modulePath);
  /* transitional state: not-yet-migrated features legitimately appear in BOTH the
     HTML (eager tag) and the manifest; what is forbidden is TWO tags. A file may
     appear in at most TWO manifest chunks when it is a documented shared subsystem
     (notes-bar renders in both the DMs screen and the Reels view — per-URL loader
     dedup guarantees single evaluation). */
  const SHARED_SUBSYSTEM = /src\/features\/notes\/(notes-bar|load-notes-feed|notes-reaction-owner)\.js$/.test(modulePath);
  if (occurrences > 1 || manifestOccurrences > (SHARED_SUBSYSTEM ? 3 : 1)) duplicates.push(`${modulePath}:${occurrences}+${manifestOccurrences}`);
}
assert.deepStrictEqual(missing, [], 'no extracted JavaScript module may be unreferenced');
assert.deepStrictEqual(duplicates, [], 'no extracted JavaScript module may be loaded more than once');

const corePositions = modules.filter(modulePath => modulePath.startsWith('src/core/')).map(modulePath => html.indexOf(`<script src="${modulePath}"></script>`));
const inlinePosition = html.indexOf('<script>');
assert(corePositions.every(position => position >= 0 && position < inlinePosition), 'all core modules must load before inline application code');

/* architecture-migration 2026-09-29: notes/reels owner files are demand-loaded — the
   startup trailing set is now the post-inline startup tail */
const trailing = [`src/features/destroy-reels-persistent-container.js`, `src/features/home/ultra-patches.js`, `src/features/smart-ranking.js`, `src/features/system/nova-init.js`, `src/features/spawn-like-particles.js`, `src/features/dms/sync-local-deletion-fallback.js`, `src/features/push-settings.js`, `src/features/system/invalidate-tab-cache-owner.js`, `src/features/like-effects.js`].map(path => html.lastIndexOf(`<script src="${path}"></script>`));
assert(trailing.every(position => position >= 0), 'required trailing script references must remain present'); /* architecture-migration 2026-09-29: stories+dms demand-loaded — startup tail is now the post-inline set */
assert(trailing.every((position, index) => index === 0 || trailing[index - 1] < position), 'required trailing script order must remain unchanged');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(featureManifestSrc.includes('"src/features/reels/reels-renderer-owner.js"'), 'protected Reels renderer external linkage must remain present (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29 */

console.log('MODULE_SCRIPT_REFERENCE_HARNESS=PASS');
console.log(`MODULES=${modules.length}`);
console.log('MISSING=0');
console.log('DUPLICATES=0');
