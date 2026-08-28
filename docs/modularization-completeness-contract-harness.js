'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const dmsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');

function countFiles(dir, suffix) {
  return fs.readdirSync(path.join(repo, dir)).filter(name => name.endsWith(suffix)).length;
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
  '<script src="src/features/smart-ranking.js"></script>',
  '<script src="src/features/nova-init.js"></script>',
  '<script src="src/features/spawn-like-particles.js"></script>',
  '<script src="src/features/like-effects.js"></script>'
];
const trailingPositions = requiredTrailing.map(marker => html.lastIndexOf(marker));
assert(trailingPositions.every(position => position >= 0), 'required trailing feature scripts must exist');
assert(trailingPositions[0] < trailingPositions[1] && trailingPositions[1] < trailingPositions[2] && trailingPositions[2] < trailingPositions[3], 'trailing feature script order must be preserved');
assert(html.indexOf('<script>') >= 0, 'protected inline application script must remain present');
assert(!html.includes('async function renderDMs('), 'approved DMs renderer must be absent from inline HTML');
assert(dmsModule.includes('window.renderDMs = async function(){'), 'approved DMs renderer must be assigned by its production module');
assert(html.indexOf('function renderReels(') >= 0, 'protected Reels renderer remains inline');
assert(html.indexOf('function createPeerConnection(') >= 0, 'protected WebRTC peer helper remains inline');
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
