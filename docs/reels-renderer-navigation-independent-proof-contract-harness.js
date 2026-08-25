const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
const htmlPath = path.join(repo, 'index.html');
const currentHtml = fs.readFileSync(htmlPath, 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const contract = fs.readFileSync(path.join(repo, 'docs', 'reels-renderer-navigation-independent-proof-contract.md'), 'utf8');
const protectedDossier = fs.readFileSync(path.join(repo, 'docs', 'reels-renderer-navigation-protected-readiness-contract.md'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('async function renderReels(){');
  assert(start >= 0, 'renderReels owner declaration must exist');
  const endMarker = '\n}\n\n// ═';
  const end = text.indexOf(endMarker, start);
  assert(end > start, 'renderReels owner boundary must be discoverable');
  return text.slice(start, end + 2);
}
function normalize(text) {
  return text.replace(/\r\n/g, '\n').replace(/^async function renderReels\(\)\{/, 'async function renderReels(){');
}
function sha(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}
const currentOwner = normalize(extractOwner(currentHtml));
const originOwner = normalize(extractOwner(originHtml));
const ownerHash = sha(originOwner);
assert.strictEqual(currentOwner, originOwner, 'Branch2 renderReels owner must retain exact immutable-origin parity');
assert(!/src\/features\/render-reels[^"']*\.js/.test(currentHtml), 'renderer must not be moved to an unapproved external module');
assert(currentHtml.includes('function renderReels('), 'renderer must remain available as a classic global-compatible declaration');
assert(contract.includes('EXACT_ORIGIN_PARITY=PASS'), 'contract must record exact owner parity');
assert(contract.includes('DETACHED_SYNTHETIC_PROOF=PASS'), 'contract must record detached proof');
assert(contract.includes('PRODUCTION_DECISION=BLOCKED'), 'production decision must remain blocked');
assert(protectedDossier.includes('PRODUCTION_DECISION=BLOCKED'), 'protected dossier must remain blocked');

function makeSandbox(mode) {
  const events = [];
  const forbidden = [];
  const screen = { style: {}, innerHTML: '', scrollTop: 0, appendChild(node) { events.push(`screen.append:${node.id || 'node'}`); } };
  const container = { id: 'reels-persistent-container', style: {}, appendChild(node) { events.push(`container.append:${node.id || 'node'}`); } };
  const video = { id: 'rv-0', muted: false, play() { events.push('video.play'); return Promise.resolve(); } };
  const elements = new Map([
    ['screen', screen],
    ['reels-persistent-container', mode === 'restore' ? container : null],
    ['rv-0', mode === 'restore' ? video : null]
  ]);
  const db = {
    from(table) {
      events.push(`db.from:${table}`);
      const chain = {
        select(value) { events.push(`db.select:${value}`); return chain; },
        eq(column, value) { events.push(`db.eq:${column}:${String(value)}`); return chain; },
        order(column, value) { events.push(`db.order:${column}:${JSON.stringify(value)}`); return chain; },
        limit(value) {
          events.push(`db.limit:${value}`);
          if (mode === 'failure') return Promise.resolve({ data: null, error: { message: table === 'posts' ? 'synthetic query failure' : 'unexpected' } });
          return Promise.resolve({ data: [], error: null });
        }
      };
      return chain;
    }
  };
  const document = {
    getElementById(id) { events.push(`dom.get:${id}`); return elements.get(id) || null; },
    querySelectorAll(selector) { forbidden.push(`querySelectorAll:${selector}`); return []; },
    createElement(tag) { forbidden.push(`createElement:${tag}`); return { style: {}, remove() {} }; }
  };
  const fn = vm.runInNewContext(`(${currentOwner})`, {
    document,
    window: { _savedReelIndex: undefined },
    db,
    ME: { id: 'synthetic-user' },
    _renderGeneration: 1,
    currentReelIdx: 0,
    reelsMuted: true,
    _applyReelsVideoWindowing() { events.push('windowing.apply'); },
    requestAnimationFrame() { forbidden.push('requestAnimationFrame'); },
    setTimeout() { forbidden.push('setTimeout'); },
    console: { log() {}, error(message) { events.push(`console.error:${message}`); } },
    GRAD: '#synthetic'
  });
  return { fn, events, forbidden, screen };
}

async function run(mode) {
  const sandbox = makeSandbox(mode);
  await sandbox.fn();
  return { events: sandbox.events, forbidden: sandbox.forbidden, screenHTML: sandbox.screen.innerHTML };
}

(async () => {
  const restore = await run('restore');
  assert(restore.events.includes('screen.append:reels-persistent-container'), 'restore branch must reattach the persistent container');
  assert(restore.events.includes('video.play'), 'restore branch must resume the current synthetic video');
  assert(restore.events.includes('windowing.apply'), 'restore branch must reapply the approved windowing handoff');
  assert.deepStrictEqual(restore.forbidden, [], 'restore branch must not query/render/create additional media nodes');

  const empty = await run('empty');
  assert(empty.events.includes('db.from:posts'), 'empty branch must perform only the read query');
  assert(empty.screenHTML.includes('Koi Reel nahi abhi'), 'empty branch must preserve the existing empty-state renderer');
  assert.deepStrictEqual(empty.forbidden, [], 'empty branch must not perform forbidden side effects');

  const failure = await run('failure');
  assert(failure.events.some(event => event.startsWith('console.error:')), 'query failure must enter the existing error boundary');
  assert(failure.screenHTML.includes('Reels load nahi hue'), 'query failure must preserve the existing retry renderer');
  assert.deepStrictEqual(failure.forbidden, [], 'query failure must not perform forbidden side effects');

  console.log('REELS_RENDERER_NAVIGATION_INDEPENDENT_PROOF_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${ownerHash}`);
  console.log('OWNER_PARITY=PASS');
  console.log('RESTORE_BRANCH=PASS');
  console.log('EMPTY_BRANCH=PASS');
  console.log('QUERY_FAILURE_BRANCH=PASS');
  console.log('DATABASE_WRITES=0');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('STORAGE_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('UPLOADS=0');
  console.log('PERMISSION_REQUESTS=0');
  console.log('LIVE_NAVIGATION=0');
  console.log('REAL_MEDIA_PLAYBACK=0');
  console.log('PRODUCTION_SPLIT=0');
})();
