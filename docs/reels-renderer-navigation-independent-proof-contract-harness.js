const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const currentHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});
const contract = fs.readFileSync(path.join(repo, 'docs', 'reels-renderer-navigation-independent-proof-contract.md'), 'utf8');
const protectedDossier = fs.readFileSync(path.join(repo, 'docs', 'reels-renderer-navigation-protected-readiness-contract.md'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('async function renderReels(){');
  assert(start >= 0, 'renderReels owner declaration must exist');
  const end = text.indexOf('\n}\n\n// ═', start);
  assert(end > start, 'renderReels owner boundary must be discoverable');
  return text.slice(start, end + 2);
}
function extractCurrentOwner(text) {
  if (text.includes('async function renderReels(){')) return extractOwner(text);
  const ownerPath = path.join(repo, 'src', 'features', 'reels-renderer-owner.js');
  const moduleText = fs.readFileSync(ownerPath, 'utf8');
  const prefix = 'window.renderReels = ';
  assert(moduleText.startsWith(prefix), 'external renderReels owner must use the classic window assignment');
  assert(moduleText.trimEnd().endsWith('};'), 'external renderReels owner must terminate as a classic assignment');
  return moduleText.slice(prefix.length, moduleText.trimEnd().length - 1).replace(/^async function\(\)/, 'async function renderReels()');
}
function normalize(text) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '');
}
function sha(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const currentOwner = extractCurrentOwner(currentHtml);
const originOwner = extractOwner(originHtml);
const normalizedCurrentOwner = normalize(currentOwner);
const normalizedOriginOwner = normalize(originOwner);
const ownerHash = sha(normalizedOriginOwner);
assert.strictEqual(normalizedCurrentOwner, normalizedOriginOwner, 'Branch2 renderReels owner must retain exact immutable-origin parity');
assert(currentHtml.includes('<script src="src/features/reels-renderer-owner.js"></script>'), 'renderer must use the approved classic external linkage');
assert(fs.existsSync(path.join(repo, 'src', 'features', 'reels-renderer-owner.js')), 'external renderer owner module must exist');
assert(!currentHtml.includes('async function renderReels(){'), 'renderer inline declaration must be removed after split');
assert(!normalizedCurrentOwner.includes('navStack'), 'navigation-stack mutation must remain outside renderReels');
assert(!normalizedCurrentOwner.includes('pushNavState'), 'navigation-stack push must remain outside renderReels');
assert(!normalizedCurrentOwner.includes('history.pushState'), 'history mutation must remain outside renderReels');
assert(contract.includes('EXACT_ORIGIN_PARITY=PASS'), 'contract must record exact owner parity');
assert(contract.includes('DETACHED_SYNTHETIC_PROOF=PASS'), 'contract must record detached proof');
assert(contract.includes('PRODUCTION_DECISION=SPLIT_COMPLETE'), 'bounded Reels production decision must record completed post-split gates');
assert(protectedDossier.includes('PRODUCTION_DECISION=BLOCKED'), 'protected dossier must remain blocked');

function node(id) {
  const listeners = {};
  return {
    id,
    style: {},
    dataset: {},
    children: [],
    clientHeight: 100,
    listeners,
    addEventListener(type, handler) {
      (listeners[type] ||= []).push(handler);
    },
    dispatch(type, event) {
      for (const handler of listeners[type] || []) handler(event);
    },
    querySelector() { return null; },
    appendChild(child) { this.children.push(child); },
    remove() {}
  };
}

function makeFeedSandbox(ownerSource, mode) {
  const events = [];
  const forbidden = [];
  const timers = [];
  const elements = new Map();
  const clock = { now: 0 };
  let screenHTML = '';
  let videos = [];
  let progressBars = [];

  const screen = node('screen');
  Object.defineProperty(screen, 'innerHTML', {
    get() { return screenHTML; },
    set(value) {
      screenHTML = String(value);
      elements.delete('reels-persistent-container');
      elements.delete('rwrap');
      elements.delete('rinner');
      elements.delete('reels-toggle-pill');
      videos = [];
      progressBars = [];
      if (!screenHTML.includes('reels-persistent-container')) return;

      const container = node('reels-persistent-container');
      elements.set(container.id, container);
      const wrap = node('rwrap');
      wrap.clientHeight = 100;
      elements.set(wrap.id, wrap);
      const inner = node('rinner');
      inner.children = [];
      elements.set(inner.id, inner);
      elements.set('reels-toggle-pill', node('reels-toggle-pill'));

      const videoRe = /<video[^>]*id="rv-(\d+)"[^>]*>/g;
      let match;
      while ((match = videoRe.exec(screenHTML))) {
        const index = Number(match[1]);
        const video = node(`rv-${index}`);
        const progress = node(`progress-${index}`);
        progress.style.width = '0%';
        video.duration = 10;
        video.currentTime = 0;
        video.muted = false;
        video.play = () => {
          events.push(`video.play:${video.id}`);
          return Promise.resolve();
        };
        video.pause = () => {
          events.push(`video.pause:${video.id}`);
        };
        video.parentElement = {
          querySelector(selector) {
            return selector === '.reel-progress-bar' ? progress : null;
          }
        };
        videos[index] = video;
        progressBars[index] = progress;
        elements.set(video.id, video);
      }
      inner.children = videos.map((_, index) => node(`reel-card-${index}`));
    }
  });
  screen.appendChild = child => events.push(`screen.append:${child.id || 'node'}`);

  const existingContainer = node('reels-persistent-container');
  const existingVideo = node('rv-0');
  existingVideo.play = () => { events.push('video.play:rv-0'); return Promise.resolve(); };
  existingVideo.pause = () => { events.push('video.pause:rv-0'); };
  existingVideo.muted = false;

  const document = {
    getElementById(id) {
      events.push(`dom.get:${id}`);
      if (mode === 'restore') {
        if (id === 'reels-persistent-container') return existingContainer;
        if (id === 'rv-0') return existingVideo;
        if (id === 'screen') return screen;
        return null;
      }
      return elements.get(id) || (id === 'screen' ? screen : null);
    },
    querySelectorAll(selector) {
      if (selector === '.rvid') return videos.filter(Boolean);
      forbidden.push(`querySelectorAll:${selector}`);
      return [];
    },
    createElement(tag) {
      forbidden.push(`createElement:${tag}`);
      return node(tag);
    }
  };

  const db = {
    from(table) {
      events.push(`db.from:${table}`);
      const chain = {
        select(value) { events.push(`db.select:${value}`); return chain; },
        eq(column, value) { events.push(`db.eq:${column}:${String(value)}`); return chain; },
        in(column, value) { events.push(`db.in:${column}:${JSON.stringify(value)}`); return chain; },
        order(column, value) { events.push(`db.order:${column}:${JSON.stringify(value)}`); return chain; },
        limit(value) {
          events.push(`db.limit:${value}`);
          if (mode === 'failure') return Promise.resolve({ data: null, error: { message: 'synthetic query failure' } });
          if (table === 'likes') return Promise.resolve({ data: [], error: null });
          if (mode === 'empty') return Promise.resolve({ data: [], error: null });
          return Promise.resolve({
            data: [0, 1, 2].map(index => ({
              id: `reel-${index}`,
              user_id: `user-${index}`,
              media_url: `https://synthetic.invalid/reel-${index}.mp4`,
              thumbnail_url: null,
              caption: `Synthetic reel ${index}`,
              likes_count: index,
              comments_count: index + 1,
              profiles: { username: `user-${index}`, avatar_url: null, is_verified: false }
            })),
            error: null
          });
        }
      };
      return chain;
    }
  };

  const window = {
    _savedReelIndex: undefined,
    _reelsViewMode: 'reels',
    navStack: [{ type: 'tab', tab: 'reels' }]
  };
  const history = { pushState() { forbidden.push('history.pushState'); } };
  const context = {
    document,
    window,
    history,
    db,
    ME: { id: 'synthetic-user' },
    _renderGeneration: 1,
    currentReelIdx: 0,
    reelsMuted: true,
    GRAD: '#synthetic-gradient',
    _applyReelsVideoWindowing() { events.push('windowing.apply'); },
    ico() { return '<svg></svg>'; },
    likeIconHTML() { return '<span>like</span>'; },
    fmt(value) { return String(value); },
    av() { return '<span>avatar</span>'; },
    Date: { now: () => clock.now },
    requestAnimationFrame(callback) { timers.push({ due: clock.now + 16, callback, kind: 'raf' }); },
    setTimeout(callback, delay) { timers.push({ due: clock.now + delay, callback, kind: 'timer' }); return timers.length; },
    console: { log() {}, error(message) { events.push(`console.error:${message}`); } }
  };
  const fn = vm.runInNewContext(`(${ownerSource})`, context);

  function flushDue(maxDue = Infinity) {
    timers.sort((a, b) => a.due - b.due);
    while (timers.length && timers[0].due <= maxDue) {
      const timer = timers.shift();
      clock.now = Math.max(clock.now, timer.due);
      timer.callback();
      timers.sort((a, b) => a.due - b.due);
    }
  }
  return { fn, events, forbidden, timers, clock, screen, elements, window, history, getVideos: () => videos, getProgressBars: () => progressBars, getScreenHTML: () => screenHTML, getCurrentIndex: () => context.currentReelIdx, flushDue };
}

async function runSimple(ownerSource, mode) {
  const events = [];
  const forbidden = [];
  const screen = { style: {}, innerHTML: '', scrollTop: 0, appendChild(node) { events.push(`screen.append:${node.id || 'node'}`); } };
  const container = { id: 'reels-persistent-container', style: {} };
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
        in(column, value) { events.push(`db.in:${column}:${JSON.stringify(value)}`); return chain; },
        order(column, value) { events.push(`db.order:${column}:${JSON.stringify(value)}`); return chain; },
        limit(value) {
          events.push(`db.limit:${value}`);
          if (mode === 'failure') return Promise.resolve({ data: null, error: { message: 'synthetic query failure' } });
          return Promise.resolve({ data: [], error: null });
        }
      };
      return chain;
    }
  };
  const document = {
    getElementById(id) { events.push(`dom.get:${id}`); return elements.get(id) || null; },
    querySelectorAll(selector) { forbidden.push(`querySelectorAll:${selector}`); return []; },
    createElement(tag) { forbidden.push(`createElement:${tag}`); return node(tag); }
  };
  const context = {
    document,
    window: { _savedReelIndex: undefined, _reelsViewMode: 'reels', navStack: [] },
    history: { pushState() { forbidden.push('history.pushState'); } },
    db,
    ME: { id: 'synthetic-user' },
    _renderGeneration: 1,
    currentReelIdx: 0,
    reelsMuted: true,
    _applyReelsVideoWindowing() { events.push('windowing.apply'); },
    ico() { return '<svg></svg>'; },
    likeIconHTML() { return '<span>like</span>'; },
    fmt(value) { return String(value); },
    av() { return '<span>avatar</span>'; },
    console: { log() {}, error(message) { events.push(`console.error:${message}`); } }
  };
  const fn = vm.runInNewContext(`(${ownerSource})`, context);
  await fn();
  return { events, forbidden, screenHTML: screen.innerHTML };
}

async function runLifecycle(ownerSource) {
  const sandbox = makeFeedSandbox(ownerSource, 'feed');
  await sandbox.fn();
  const wrap = sandbox.elements.get('rwrap');
  const inner = sandbox.elements.get('rinner');
  assert(wrap, `feed render must create the swipe wrapper; html=${sandbox.getScreenHTML()}`);
  assert(inner, 'feed render must create the swipe inner container');
  assert.strictEqual((wrap.listeners.touchstart || []).length, 1, 'one touchstart listener required');
  assert.strictEqual((wrap.listeners.touchmove || []).length, 1, 'one touchmove listener required');
  assert.strictEqual((wrap.listeners.touchend || []).length, 1, 'one touchend listener required');

  const initialHTML = sandbox.getScreenHTML();
  const initialStack = JSON.stringify(sandbox.window.navStack);
  sandbox.clock.now = 0;
  sandbox.flushDue(100);
  assert(sandbox.events.includes('video.play:rv-0'), 'initial playback timer must play the first video');

  const firstVideo = sandbox.getVideos()[0];
  firstVideo.currentTime = 2;
  firstVideo.ontimeupdate();
  assert.strictEqual(sandbox.getProgressBars()[0].style.width, '20%', 'progress timing must update the first reel bar');

  sandbox.clock.now = 1000;
  wrap.dispatch('touchstart', { touches: [{ clientY: 80 }] });
  wrap.dispatch('touchmove', { touches: [{ clientY: 20 }] });
  assert.strictEqual(inner.style.transition, 'none', 'live swipe must disable transition');
  wrap.dispatch('touchend', { changedTouches: [{ clientY: 20 }] });
  assert.strictEqual(sandbox.getCurrentIndex(), 1, 'fast swipe must advance to the middle reel');
  assert(String(inner.style.transition).includes('0.24s'), 'settle transition must remain 240ms');
  assert.strictEqual(sandbox.getVideos()[1].currentTime, 0, 'new active video must reset to zero');
  for (const index of [0, 1, 2]) assert(sandbox.events.includes(`video.pause:rv-${index}`), `swipe must pause reel ${index}`);
  assert(sandbox.events.includes('video.play:rv-1'), 'swipe must play the new active video');
  sandbox.flushDue(1400);
  assert.strictEqual(inner.style.transition, '', 'settle cleanup must clear transition after 290ms');

  const middleIndex = sandbox.getCurrentIndex();
  sandbox.clock.now = 2000;
  wrap.dispatch('touchstart', { touches: [{ clientY: 50 }] });
  wrap.dispatch('touchend', { changedTouches: [{ clientY: 48 }] });
  assert.strictEqual(sandbox.getCurrentIndex(), middleIndex, 'cancelled short swipe must keep the active index');
  sandbox.flushDue(2400);

  sandbox.clock.now = 3000;
  wrap.dispatch('touchstart', { touches: [{ clientY: 80 }] });
  wrap.dispatch('touchend', { changedTouches: [{ clientY: 20 }] });
  assert.strictEqual(sandbox.getCurrentIndex(), 2, 'fast swipe must advance to the last reel');
  sandbox.flushDue(3400);
  const lastIndex = sandbox.getCurrentIndex();
  sandbox.clock.now = 4000;
  wrap.dispatch('touchstart', { touches: [{ clientY: 20 }] });
  wrap.dispatch('touchend', { changedTouches: [{ clientY: 80 }] });
  assert.strictEqual(sandbox.getCurrentIndex(), lastIndex - 1, 'backward swipe must return from the last reel');
  sandbox.flushDue(4400);

  const overlayNeedles = [
    'ondblclick="dblLikeReel',
    'onclick="toggleLike',
    'onclick="openComments',
    'onclick="shareIt()',
    'onclick="showCreate(\'reel\')',
    'onclick="goToProfile'
  ];
  for (const needle of overlayNeedles) assert(initialHTML.includes(needle), `overlay wiring must retain ${needle}`);
  assert.strictEqual(JSON.stringify(sandbox.window.navStack), initialStack, 'renderReels must not mutate the navigation stack');
  assert.strictEqual(sandbox.forbidden.includes('history.pushState'), false, 'renderReels must not mutate browser history');
  assert.strictEqual(sandbox.timers.length, 0, 'all scheduled playback/settle timers must be cleaned in the synthetic run');
  assert.deepStrictEqual(sandbox.forbidden, [], 'lifecycle proof must not invoke forbidden DOM/media/network operations');

  return {
    html: initialHTML,
    trace: sandbox.events,
    forbidden: sandbox.forbidden,
    finalIndex: sandbox.getCurrentIndex(),
    finalTransition: inner.style.transition,
    stack: sandbox.window.navStack,
    timersRemaining: sandbox.timers.length
  };
}

function runExtractionCandidateSimulation() {
  const linkage = '<script src="src/features/reels-renderer-experimental.js"></script>\n';
  const anonymousOwner = currentOwner.replace(/^async function renderReels\(\)\{/, 'async function(){');
  const moduleText = `window.renderReels = ${anonymousOwner};\n`;
  const candidateHtml = currentHtml.replace(currentOwner, '').replace('<script>\n', linkage + '<script>\n');
  const linkageIndex = candidateHtml.indexOf(linkage);
  const inlineIndex = candidateHtml.indexOf('<script>\n');
  assert(linkageIndex > 0 && linkageIndex < inlineIndex, 'candidate linkage must precede the inline application script');
  const rendererLinkageToken = 'src="src/features/reels-renderer-experimental.js"';
  assert.strictEqual(candidateHtml.split(rendererLinkageToken).length - 1, 1, 'candidate must contain one renderer linkage');
  assert(!candidateHtml.includes('async function renderReels(){'), 'candidate HTML must remove the inline renderer owner');
  const candidatePrefix = 'window.renderReels = async function(){';
  assert(moduleText.startsWith(candidatePrefix), 'candidate must expose an anonymous classic global owner');
  const scriptTags = candidateHtml.split('\n').filter(line => line.startsWith('<script'));
  assert(!scriptTags.some(tag => tag.includes('type="module"') || tag.includes('defer')), 'candidate script tags must remain classic and non-deferred');
  const candidateNamedOwner = 'async function renderReels(){' + moduleText.slice(candidatePrefix.length, -2);
  assert.strictEqual(normalize(candidateNamedOwner), normalize(originOwner), 'candidate owner body must match immutable origin');
  assert.strictEqual(sha(candidateHtml), 'ca322b8894298c30c2524e37a7f5e4dd23ae3c4443bb8ede08c6db971a5d9ac6', 'candidate HTML hash must remain pinned after the create-offer-to-participant owner split');
  return {
    ownerSource: candidateNamedOwner,
    moduleSha256: sha(moduleText),
    candidateHtmlSha256: sha(candidateHtml),
    baselineHtmlSha256: sha(currentHtml)
  };
}

function runRollbackSimulation() {
  const linkage = '<script src="src/features/reels-renderer-experimental.js"></script>\n';
  const experimentalModule = `window.renderReels = ${originOwner}`;
  const afterSplitHtml = originHtml.replace(originOwner, linkage);
  assert(afterSplitHtml.includes(linkage), 'synthetic split must add only the pinned external linkage');
  assert(!afterSplitHtml.includes(originOwner), 'synthetic split must remove the inline owner');
  assert(/^window\.renderReels\s*=\s*async function renderReels\(\)\{/.test(experimentalModule), 'synthetic module must use the classic global owner form');
  const rolledBackHtml = afterSplitHtml.replace(linkage, originOwner);
  assert.strictEqual(rolledBackHtml, originHtml, 'rollback must restore the exact pre-split HTML');
  assert.strictEqual(sha(rolledBackHtml), sha(originHtml), 'rollback whole-file hash must match baseline');
  assert.strictEqual(normalize(extractOwner(rolledBackHtml)), normalizedOriginOwner, 'rollback owner hash must match immutable origin');
  return {
    baselineHtmlSha256: sha(originHtml),
    experimentalModuleSha256: sha(experimentalModule),
    rollbackHtmlSha256: sha(rolledBackHtml),
    rollbackOwnerSha256: sha(normalize(extractOwner(rolledBackHtml)))
  };
}

(async () => {
  const restoreBefore = await runSimple(originOwner, 'restore');
  const restoreAfter = await runSimple(currentOwner, 'restore');
  assert.deepStrictEqual(restoreAfter, restoreBefore, 'restore branch before/after trace must match');
  assert(restoreBefore.events.includes('screen.append:reels-persistent-container'), 'restore branch must reattach the persistent container');
  assert(restoreBefore.events.includes('video.play'), 'restore branch must resume the current synthetic video');
  assert(restoreBefore.events.includes('windowing.apply'), 'restore branch must reapply windowing');
  assert.deepStrictEqual(restoreBefore.forbidden, [], 'restore branch must not perform forbidden side effects');

  const emptyBefore = await runSimple(originOwner, 'empty');
  const emptyAfter = await runSimple(currentOwner, 'empty');
  assert.deepStrictEqual(emptyAfter, emptyBefore, 'empty branch before/after trace must match');
  assert(emptyBefore.screenHTML.includes('Koi Reel nahi abhi'), 'empty branch must preserve the existing empty-state renderer');
  assert.deepStrictEqual(emptyBefore.forbidden, [], 'empty branch must not perform forbidden side effects');

  const failureBefore = await runSimple(originOwner, 'failure');
  const failureAfter = await runSimple(currentOwner, 'failure');
  assert.deepStrictEqual(failureAfter, failureBefore, 'failure branch before/after trace must match');
  assert(failureBefore.events.some(event => event.startsWith('console.error:')), 'failure branch must enter the existing error boundary');
  assert(failureBefore.screenHTML.includes('Reels load nahi hue'), 'failure branch must preserve the existing retry renderer');
  assert.deepStrictEqual(failureBefore.forbidden, [], 'failure branch must not perform forbidden side effects');

  const lifecycleBefore = await runLifecycle(originOwner);
  const lifecycleAfter = await runLifecycle(currentOwner);
  assert.deepStrictEqual(lifecycleAfter, lifecycleBefore, 'full lifecycle before/after traces must match');
  const extractionCandidate = runExtractionCandidateSimulation();
  const lifecycleCandidate = await runLifecycle(extractionCandidate.ownerSource);
  assert.deepStrictEqual(lifecycleCandidate, lifecycleBefore, 'temporary extracted candidate lifecycle must match immutable-origin lifecycle');
  const rollback = runRollbackSimulation();

  console.log('REELS_RENDERER_NAVIGATION_INDEPENDENT_PROOF_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${ownerHash}`);
  console.log('OWNER_PARITY=PASS');
  console.log('RESTORE_BEFORE_AFTER=PASS');
  console.log('EMPTY_BEFORE_AFTER=PASS');
  console.log('QUERY_FAILURE_BEFORE_AFTER=PASS');
  console.log('SWIPE_BEFORE_AFTER=PASS');
  console.log('PLAYBACK_BEFORE_AFTER=PASS');
  console.log('OVERLAY_WIRING_BEFORE_AFTER=PASS');
  console.log('NAVIGATION_STACK_ISOLATION_BEFORE_AFTER=PASS');
  console.log('TIMING_BEFORE_AFTER=PASS');
  console.log('CLEANUP_BEFORE_AFTER=PASS');
  console.log(`BEFORE_TRACE_SHA256=${sha(JSON.stringify(lifecycleBefore.trace))}`);
  console.log(`AFTER_TRACE_SHA256=${sha(JSON.stringify(lifecycleAfter.trace))}`);
  console.log('NONPRODUCTION_EXTRACTION_CANDIDATE=PASS');
  console.log(`CANDIDATE_MODULE_SHA256=${extractionCandidate.moduleSha256}`);
  console.log(`CANDIDATE_AFTER_HTML_SHA256=${extractionCandidate.candidateHtmlSha256}`);
  console.log(`CANDIDATE_BASELINE_HTML_SHA256=${extractionCandidate.baselineHtmlSha256}`);
  console.log('ONE_EXTERNAL_LINKAGE=PASS');
  console.log('INLINE_OWNER_REMOVED_IN_CANDIDATE=PASS');
  console.log('CLASSIC_GLOBAL_OWNER_IN_CANDIDATE=PASS');
  console.log('CANDIDATE_SCRIPT_ORDER=PASS');
  console.log('CANDIDATE_LIFECYCLE_PARITY=PASS');
  console.log('ROLLBACK_AFTER_SPLIT_SIMULATION=PASS');
  console.log(`ROLLBACK_BASELINE_HTML_SHA256=${rollback.baselineHtmlSha256}`);
  console.log(`ROLLBACK_EXPERIMENT_MODULE_SHA256=${rollback.experimentalModuleSha256}`);
  console.log(`ROLLBACK_RESTORED_HTML_SHA256=${rollback.rollbackHtmlSha256}`);
  console.log(`ROLLBACK_OWNER_SHA256=${rollback.rollbackOwnerSha256}`);
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
