const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const nova = fs.readFileSync(path.join(repo, 'src', 'features', 'nova-init.js'), 'utf8');
const likes = fs.readFileSync(path.join(repo, 'src', 'features', 'like-effects.js'), 'utf8');

assert(nova.includes('const _origShowApp = window.showApp;'), 'nova-init must capture the inline showApp global');
assert(nova.includes("if(typeof _origShowApp === 'function')"), 'nova-init must guard the captured showApp seam');
assert(nova.includes('_origShowApp.apply(this, arguments);'), 'nova-init must forward original showApp arguments and receiver');
assert(nova.includes('setTimeout(initNovaFeatures, 100);'), 'nova-init must retain the 100ms initialization settling delay');
assert(nova.includes('function initNovaFeatures(){'), 'nova-init must retain its initialization entry point');

assert(likes.includes('const _origToggleLikeOrig = window.toggleLike;'), 'like-effects must capture the inline toggleLike global');
assert(likes.includes("if(typeof _origToggleLikeOrig === 'function')"), 'like-effects must guard the captured toggleLike seam');
assert(likes.includes('_origToggleLikeOrig.apply(this, arguments);'), 'like-effects must forward original toggleLike arguments and receiver');
assert(likes.includes("const wasLiked = el?.dataset?.liked === 'true';"), 'like-effects must capture the pre-toggle state');
assert(likes.includes("const nowLiked = el?.dataset?.liked === 'true';"), 'like-effects must capture the post-toggle state');
assert(likes.includes('if(nowLiked && !wasLiked && el){'), 'particles must run only for a new like transition');
assert(likes.includes('spawnLikeParticles(el);'), 'like-effects must retain the inline particle helper seam');

const inlineStart = html.indexOf('\n<script>\n');
const order = ['smart-ranking.js', 'nova-init.js', 'like-effects.js'].map((name) => html.indexOf(`src/features/${name}`));
assert(inlineStart >= 0, 'inline application script boundary must remain');
assert(order.every((position) => position > inlineStart), 'all wrapper scripts must remain after inline application code');
assert(order[0] < order[1] && order[1] < order[2], 'wrapper scripts must retain smart-ranking, nova-init, like-effects order');

console.log('EXTRACTED_WRAPPER_SEAM_HARNESS=PASS');
console.log('SHOW_APP_WRAPPER=PASS');
console.log('TOGGLE_LIKE_WRAPPER=PASS');
console.log('PARTICLE_SEAM=PASS');
console.log('TRAILING_SCRIPT_ORDER=PASS');
