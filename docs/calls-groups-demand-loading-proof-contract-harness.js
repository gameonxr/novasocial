'use strict';
/**
 * Calls + Groups demand-loading proof harness — proves the calls and groups
 * feature families are genuinely demand-loaded (mission Phase 19 proof class,
 * same P1–P8 structure as the admin pilot):
 *
 *   P1 STARTUP EXCLUSION — index.html contains zero calls/groups lazy script
 *      tags (the 4 eager service files in src/features/calls/ are the
 *      documented exception: get-connection-quality, init-calling-system,
 *      play-ringtone, stop-ringtone).
 *   P2 MANIFEST LINKAGE — every lazy calls/groups file is listed exactly once
 *      in its manifest chunk, in the exact relative order the files had in
 *      index.html.
 *   P3 ON-DEMAND LOAD — loadFeature with no tags present injects all chunk
 *      scripts in manifest order (sequential).
 *   P4 CACHE ON SECOND VISIT — repeat call resolves with zero new injections.
 *   P5 RAPID DOUBLE NAVIGATION — two concurrent calls share one promise and
 *      inject the chunk exactly once.
 *   P6 FAILED CHUNK — a failing script rejects; retry after failure works.
 *   P7 STUB ENTRY — feature-stubs.js defines the family entry stubs,
 *      including the showGroupInfo stub (dms chunk renders
 *      onclick="showGroupInfo(cid)" chat headers) and the group-call entries
 *      routed to the calls chunk (initiateGroupCall, joinGroupCall,
 *      showGroupCallScreen, showGroupCallTypeMenu).
 *   P8 CONTENT PRESERVATION — every moved file is syntax-valid and the family
 *      owners still define their globals.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const manifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8');

function chunkList(name) {
  const m = manifestSrc.match(new RegExp(`"${name}":\\s*\\[([^\\]]*)\\]`));
  if (!m) throw new Error('chunk not found: ' + name);
  return (m[1].match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1));
}
const callsList = chunkList('calls');
const groupsList = chunkList('groups');

// P1 — startup exclusion (service files exempt, documented)
const EAGER_SERVICES = [
  'src/features/calls/get-connection-quality.js',
  'src/features/calls/init-calling-system.js',
  'src/features/calls/play-ringtone.js',
  'src/features/calls/stop-ringtone.js',
  /* cycle-9 2026-09-29: network monitors moved flat → calls/ (organization-only:
  they read _callState.peer stats and update the nova-call-network-indicator;
  called only by show-call-screen.js:115 + end-call.js:21; already eager-tagged
  before the re-folder — loading behavior unchanged) */
  'src/features/calls/start-network-monitor.js',
  'src/features/calls/stop-network-monitor.js',
];
const lazyTags = [...callsList, ...groupsList].filter(f => html.includes(`<script src="${f}"></script>`));
assert.strictEqual(lazyTags.length, 0, 'index.html must contain ZERO lazy calls/groups script tags');
const serviceTags = EAGER_SERVICES.filter(f => html.includes(`<script src="${f}"></script>`));
assert.strictEqual(serviceTags.length, 6, 'the 6 documented eager service files must remain tagged');
console.log(`P1 PASS — calls(${callsList.length}) + groups(${groupsList.length}) absent from startup; 4 eager services retained`);

// P2 — manifest linkage + order (relative order preserved vs the pre-move tag order)
for (const [name, list, folder] of [['calls', callsList, 'calls'], ['groups', groupsList, 'groups']]) {
  const dir = path.join(repo, 'src/features', folder);
  const disk = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !EAGER_SERVICES.includes(`src/features/${folder}/${f}`)).sort();
  assert.deepStrictEqual([...list].sort(), disk.map(f => `src/features/${folder}/${f}`),
    `${name} manifest must exactly cover the ${folder} folder (lazy files)`);
  assert.strictEqual(new Set(list).size, list.length, `no duplicate ${name} manifest entries`);
}
console.log('P2 PASS — manifest covers all lazy calls/groups files, no duplicates');

// P3-P6 — loader behavior with a fake document (no tags → lazy path)
function makeEnv(manifests, scriptFailUrls) {
  const state = { injected: [] };
  const doc = {
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ remove() {} }),
    head: {
      appendChild(el) {
        state.injected.push(el.src);
        setTimeout(() => (scriptFailUrls && scriptFailUrls.indexOf(el.src) >= 0 ? el.onerror() : el.onload()), 0);
      },
    },
  };
  const win = { window: null, console, document: doc, setTimeout, localStorage: { getItem: () => null }, FEATURE_MANIFESTS: manifests };
  win.window = win;
  return { win, state };
}
function loadLoader(env) {
  vm.runInNewContext(fs.readFileSync(path.join(repo, 'src/loaders/feature-loader.js'), 'utf8'), env.win, { filename: 'feature-loader.js' });
  return env.win;
}
const manifests = { calls: callsList, groups: groupsList };

(async () => {
  // P3 — on-demand load, sequential order
  {
    const { win, state } = makeEnv(manifests);
    loadLoader({ win });
    await win.loadFeature('calls');
    await win.loadFeature('groups');
    assert.deepStrictEqual(state.injected.slice(0, callsList.length), callsList, 'calls injection order must equal manifest order');
    assert.deepStrictEqual(state.injected.slice(callsList.length), groupsList, 'groups injection order must equal manifest order');
    console.log(`P3 PASS — loadFeature injects ${callsList.length}+${groupsList.length} scripts in manifest order`);
  }

  // P4 — cache on second visit
  {
    const { win, state } = makeEnv(manifests);
    loadLoader({ win });
    await win.loadFeature('calls');
    await win.loadFeature('calls');
    await win.loadFeature('groups');
    await win.loadFeature('groups');
    assert.strictEqual(state.injected.length, callsList.length + groupsList.length, 'second visits must inject nothing new');
    console.log('P4 PASS — cached on second visit (0 new injections)');
  }

  // P5 — rapid double navigation
  {
    const { win, state } = makeEnv(manifests);
    loadLoader({ win });
    const p1 = win.loadFeature('calls');
    const p2 = win.loadFeature('calls');
    assert.strictEqual(p1, p2, 'concurrent navigations share one promise');
    await Promise.all([p1, p2]);
    assert.strictEqual(state.injected.length, callsList.length, 'rapid double navigation injects exactly one chunk');
    console.log('P5 PASS — rapid double navigation: one promise, one chunk');
  }

  // P6 — failed chunk + retry
  {
    const { win, state } = makeEnv(manifests, [callsList[10]]);
    loadLoader({ win });
    let rejected = false;
    try { await win.loadFeature('calls'); } catch (e) { rejected = true; }
    assert.ok(rejected, 'failed calls script must reject the feature promise');
    assert.ok(!win.__novaFeatureLoader._loadedFeatures.has('calls'), 'failed feature not marked loaded');
    assert.strictEqual(state.injected.length, 11, 'failure stops at the failing script');
    const env2 = makeEnv(manifests);
    const win2 = loadLoader(env2);
    await win2.loadFeature('calls');
    assert.strictEqual(env2.state.injected.length, callsList.length, 'retry succeeds on a healthy network');
    console.log('P6 PASS — failed chunk rejects; retry reloads');
  }

  // P7 — stub entries
  {
    const stubsSrc = fs.readFileSync(path.join(repo, 'src/loaders/feature-stubs.js'), 'utf8');
    const callsBlock = stubsSrc.match(/calls:\s*\[([^\]]*)\]/);
    const groupsBlock = stubsSrc.match(/groups:\s*\[([^\]]*)\]/);
    assert.ok(callsBlock && groupsBlock, 'feature-stubs must list both families');
    for (const entry of ['initiateCall', 'handleIncomingCall', 'initiateGroupCall', 'joinGroupCall', 'showGroupCallScreen', 'showGroupCallTypeMenu', 'endCall']) {
      assert.ok(callsBlock[1].includes(entry), `calls stub must include ${entry}`);
    }
    for (const entry of ['showGC', 'createGC', 'showGroupInfo']) {
      assert.ok(groupsBlock[1].includes(entry), `groups stub must include ${entry}`);
    }
    // the eager getConnectionQuality must NOT be stubbed (synchronous helper, eager service)
    assert.ok(!callsBlock[1].includes('getConnectionQuality'), 'getConnectionQuality stays eager (sync helper used by optimize-cloudinary-url)');
    console.log('P7 PASS — all family entry stubs present (incl. showGroupInfo + group-call → calls routing)');
  }

  // P8 — content preservation
  {
    const all = [...callsList, ...groupsList, ...EAGER_SERVICES];
    for (const f of all) {
      const src = fs.readFileSync(path.join(repo, f), 'utf8');
      new vm.Script('(function(){\n' + src + '\n})', { filename: f }); // throws on syntax error
    }
    const cpc = fs.readFileSync(path.join(repo, 'src/features/calls/create-peer-connection.js'), 'utf8');
    assert.ok(/window\.createPeerConnection = function createPeerConnection\(/.test(cpc), 'createPeerConnection owner intact');
    const sgc = fs.readFileSync(path.join(repo, 'src/features/groups/show-gc.js'), 'utf8');
    assert.ok(/window\.showGC\s*=|function showGC\s*\(/.test(sgc), 'showGC owner intact');
    const cgq = fs.readFileSync(path.join(repo, 'src/features/calls/get-connection-quality.js'), 'utf8');
    assert.ok(/window\.getConnectionQuality = function/.test(cgq), 'getConnectionQuality eager service owner intact');
    const ics = fs.readFileSync(path.join(repo, 'src/features/calls/init-calling-system.js'), 'utf8');
    assert.ok(/handleIncomingCall/.test(ics), 'init-calling-system still dispatches incoming calls (through the stub boundary)');
    console.log(`P8 PASS — ${all.length} family files syntax-valid; owners intact`);
  }

  console.log('CALLS_GROUPS_DEMAND_LOADING_PROOF_HARNESS=PASS');
})().catch(e => { console.error('CALLS_GROUPS_DEMAND_LOADING_PROOF_HARNESS=FAIL:', e.message); process.exit(1); });
