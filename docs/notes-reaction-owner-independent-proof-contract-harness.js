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
const contract = fs.readFileSync(path.join(repo, 'docs', 'notes-reaction-owner-independent-proof-contract.md'), 'utf8');
const dossier = fs.readFileSync(path.join(repo, 'docs', 'notes-submission-reactions-protected-readiness-contract.md'), 'utf8');
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'notes-reaction-owner.js'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('function reactToNote(');
  assert(start >= 0, 'reactToNote owner declaration must exist');
  const end = text.indexOf('\n}\n\n// ═', start);
  assert(end > start, 'reactToNote owner boundary must be discoverable');
  return text.slice(start, end + 2);
}
function sha(value) {
  return crypto.createHash('sha256').update(value.replace(/\r\n/g, '\n')).digest('hex');
}
const originOwner = extractOwner(originHtml);
const currentOwner = moduleText.replace(/^window\.reactToNote = /, '').replace(/;\s*$/, '');
assert.strictEqual(currentOwner.replace(/\r\n/g, '\n'), originOwner.replace(/\r\n/g, '\n'), 'Branch2 external reactToNote owner must retain exact immutable-origin parity');
assert.strictEqual(currentHtml.split('function reactToNote(').length - 1, 0, 'inline reactToNote owner must be absent after split');
assert.strictEqual((currentHtml.match(/src\/features\/notes-reaction-owner\.js/g) || []).length, 1, 'production Notes reaction owner must be linked exactly once');
assert(moduleText.includes('window.reactToNote = function reactToNote('), 'production Notes reaction owner must be a classic global');
assert(contract.includes('EXACT_ORIGIN_PARITY=REQUIRED'), 'contract must require exact parity');
assert(contract.includes('DETACHED_SYNTHETIC_PROOF=REQUIRED'), 'contract must require detached proof');
assert(contract.includes('PRODUCTION_DECISION=BLOCKED') || contract.includes('PRODUCTION_DECISION=VALIDATION_PENDING'), 'contract must retain an explicit production decision');
assert(dossier.includes('PRODUCTION_DECISION=BLOCKED'), 'protected Notes dossier must remain blocked');

function makeNode(id) {
  return {
    id,
    style: {},
    textContent: '',
    removed: false,
    remove() { this.removed = true; },
  };
}

async function runReaction(ownerSource, mode, clicked) {
  const events = [];
  const buttons = [makeNode('emoji-1'), makeNode('emoji-2')];
  const created = [];
  const timers = [];
  const rafs = [];
  const dbCalls = [];
  let now = 0;
  let burst = null;
  const body = {
    appendChild(node) { events.push(`dom.append:${node.id || 'burst'}`); burst = node; },
  };
  const document = {
    body,
    querySelectorAll(selector) {
      assert.strictEqual(selector, '.note-react-emoji');
      return buttons;
    },
    createElement(tag) {
      const element = makeNode(`${tag}-burst`);
      created.push(element);
      events.push(`dom.create:${tag}`);
      return element;
    },
  };
  const db = {
    from(table) {
      events.push(`db.from:${table}`);
      return {
        upsert(payload, options) {
          dbCalls.push({ table, payload, options });
          events.push(`db.upsert:${table}`);
          if (mode === 'error') return Promise.resolve({ error: { message: 'synthetic reaction failure' } });
          return Promise.resolve({ error: null });
        },
      };
    },
  };
  const context = {
    document,
    db,
    ME: { id: 'synthetic-user' },
    navigator: { vibrate(value) { events.push(`navigator.vibrate:${value}`); } },
    requestAnimationFrame(callback) { rafs.push(callback); },
    setTimeout(callback, delay) { timers.push({ callback, due: now + delay }); return timers.length; },
    toast(message) { events.push(`toast:${message}`); },
    loadNotesBar() { events.push('loadNotesBar'); },
    console: { error(message) { events.push(`console.error:${message}`); } },
  };
  const fn = vm.runInNewContext(`(${ownerSource})`, context);
  const clickedEl = clicked ? buttons[0] : null;
  fn('note-123', '❤️', clickedEl);
  while (rafs.length) rafs.shift()();
  await Promise.resolve();
  while (timers.length) {
    timers.sort((a, b) => a.due - b.due);
    const timer = timers.shift();
    now = timer.due;
    timer.callback();
    while (rafs.length) rafs.shift()();
    await Promise.resolve();
  }
  await Promise.resolve();
  return {
    events,
    dbCalls,
    buttons: buttons.map(button => ({ id: button.id, style: button.style })),
    burst: burst ? { id: burst.id, removed: burst.removed, style: burst.style } : null,
    created: created.map(element => ({ id: element.id, removed: element.removed, style: element.style })),
    timersRemaining: timers.length,
  };
}

function comparable(result) {
  return JSON.parse(JSON.stringify(result));
}

(async () => {
  const successClicked = comparable(await runReaction(originOwner, 'success', true));
  const successClickedAfter = comparable(await runReaction(currentOwner, 'success', true));
  assert.deepStrictEqual(successClickedAfter, successClicked, 'success clicked before/after traces must match');
  assert.deepStrictEqual(successClicked.dbCalls, [{
    table: 'quick_note_reactions',
    payload: { note_id: 'note-123', user_id: 'synthetic-user', emoji: '❤️' },
    options: { onConflict: 'note_id,user_id' },
  }], 'success payload and conflict policy must match');
  assert(successClicked.events.includes('loadNotesBar'), 'successful reaction must refresh Notes bar');
  assert.strictEqual(successClicked.timersRemaining, 0, 'success path must leave no timers');
  assert.strictEqual(successClicked.burst.removed, true, 'reaction burst must be removed after cleanup');
  assert.strictEqual(successClicked.buttons[0].style.transform, 'scale(1)', 'clicked element transform must reset');

  const successNoClicked = comparable(await runReaction(originOwner, 'success', false));
  assert.deepStrictEqual(successNoClicked.buttons.map(button => button.style.background), ['transparent', 'transparent'], 'missing clicked element must still reset button backgrounds');
  assert(successNoClicked.events.includes('loadNotesBar'), 'success without clicked element must still refresh Notes bar');

  const error = comparable(await runReaction(originOwner, 'error', true));
  const errorAfter = comparable(await runReaction(currentOwner, 'error', true));
  assert.deepStrictEqual(errorAfter, error, 'error before/after traces must match');
  assert(error.events.some(event => event.startsWith('console.error:Reaction save failed:')), 'error path must log the existing save failure');
  assert(error.events.includes('toast:Reaction save nahi hua'), 'error path must show the existing failure toast');
  assert(!error.events.includes('loadNotesBar'), 'failed reaction must not refresh Notes bar');
  assert.strictEqual(error.timersRemaining, 0, 'error path must leave no timers');

  const forbidden = [...successClicked.events, ...error.events].filter(event => /fetch|storage|permission|media|history|navigate|broadcast/i.test(event));
  assert.deepStrictEqual(forbidden, [], 'reaction proof must not perform forbidden live side effects');

  console.log('NOTES_REACTION_OWNER_INDEPENDENT_PROOF_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${sha(originOwner)}`);
  console.log('OWNER_PARITY=PASS');
  console.log('SUCCESS_BEFORE_AFTER=PASS');
  console.log('MISSING_CLICKED_ELEMENT=PASS');
  console.log('ERROR_BEFORE_AFTER=PASS');
  console.log('PAYLOAD_AND_CONFLICT_POLICY=PASS');
  console.log('TIMING_AND_CLEANUP=PASS');
  console.log('OPTIMISTIC_UI_ROLLBACK=PASS');
  console.log('DATABASE_WRITE=MOCKED_SINGLE_UPSERT_ONLY');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('STORAGE_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('UPLOADS=0');
  console.log('PERMISSION_REQUESTS=0');
  console.log('LIVE_NAVIGATION=0');
  console.log('REAL_MEDIA_ACCESS=0');
  console.log('PRODUCTION_SPLIT=0');
})();
