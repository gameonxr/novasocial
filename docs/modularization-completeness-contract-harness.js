'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29 */
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const dmsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms', 'dms-renderer-owner.js') /* architecture-migration 2026-09-29: dms folder */, 'utf8');
const reelsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'reels', 'reels-renderer-owner.js'), 'utf8');

/* architecture-migration 2026-09-29: recursive count — feature files live in feature subfolders */
function countFiles(dir, suffix) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : (e.name.endsWith(suffix) ? [path.join(d, e.name)] : []));
  return walk(path.join(repo, dir)).length;
}

const styles = countFiles('src/styles', '.css');
const core = countFiles('src/core', '.js');
const components = countFiles('src/components', '.js');
const features = countFiles('src/features', '.js');

assert.strictEqual(styles, 18, 'all 18 extracted stylesheets must remain present');
assert.strictEqual(core, 9, 'all 9 extracted core scripts must remain present');
assert.strictEqual(components, 2, 'both extracted shared components must remain present');
assert(features >= 200, 'feature extraction set must remain at least 200 modules');

const requiredTrailing = [
  '<script src="src/features/home/smart-ranking.js"></script>',
  '<script src="src/features/system/nova-init.js"></script>',
  '<script src="src/features/spawn-like-particles.js"></script>',
  '<script src="src/features/like-effects.js"></script>'
];
const trailingPositions = requiredTrailing.map(marker => html.lastIndexOf(marker));
assert(trailingPositions.every(position => position >= 0), 'required trailing feature scripts must exist');
assert(trailingPositions[0] < trailingPositions[1] && trailingPositions[1] < trailingPositions[2] && trailingPositions[2] < trailingPositions[3], 'trailing feature script order must be preserved');
assert(html.indexOf('<script>') >= 0, 'protected inline application script must remain present');
assert(!html.includes('async function renderDMs('), 'approved DMs renderer must be absent from inline HTML');
assert(dmsModule.includes('window.renderDMs = async function(){'), 'approved DMs renderer must be assigned by its production module');
assert(featureManifestSrc.includes('"src/features/reels/reels-renderer-owner.js"'), 'approved Reels renderer linkage remains present (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29 */
assert(reelsModule.includes('window.renderReels = async function(){'), 'approved Reels renderer remains available through its external owner');
assert(!html.includes('function createPeerConnection('), 'approved WebRTC peer helper must be absent from inline HTML');
assert(fs.readFileSync(path.join(repo, 'src', 'features', 'calls', 'create-peer-connection.js') /* architecture-migration 2026-09-29: calls folder */, 'utf8').includes('window.createPeerConnection = function createPeerConnection('), 'approved WebRTC peer helper must be assigned by its production module');
assert(!html.includes('function spawnLikeParticles('), 'approved particle helper must be absent from inline HTML');
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle helper must be assigned by its production module');

const coreScriptPositions = [...html.matchAll(/<script src="src\/core\/[^\"]+\.js"><\/script>/g)].map(match => match.index);
const appScriptPosition = html.indexOf('<script>');
assert(coreScriptPositions.length === 9, 'all core script tags must be integrated in index.html');
assert(coreScriptPositions.every(position => position < appScriptPosition), 'core scripts must load before inline application script');

console.log('MODULARIZATION_COMPLETENESS_HARNESS=PASS');
console.log(`STYLES=${styles}`);
console.log(`CORE=${core}`);
console.log(`COMPONENTS=${components}`);
console.log(`FEATURES=${features}`);
