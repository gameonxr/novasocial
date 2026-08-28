const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'notes-reaction-owner.js'), 'utf8');
const authorization = fs.readFileSync(path.join(repo, 'docs', 'notes-reaction-owner-production-authorization-addendum.md'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('function reactToNote(');
  assert(start >= 0, 'reactToNote owner signature missing');
  const end = text.indexOf('\n}\n\n// ═', start);
  assert(end > start, 'reactToNote inline boundary missing');
  return text.slice(start, end + 2);
}
function normalize(text) { return text.replace(/\r\n/g, '\n').trim(); }
function sha(text) { return crypto.createHash('sha256').update(normalize(text)).digest('hex'); }
const originOwner = extractOwner(originHtml);
const moduleOwner = moduleText.replace(/^window\.reactToNote = /, '').replace(/;\s*$/, '');
assert.strictEqual(normalize(moduleOwner), normalize(originOwner), 'external owner must match immutable origin body exactly');
assert.strictEqual((moduleText.match(/window\.reactToNote\s*=\s*function reactToNote\(/g) || []).length, 1, 'module must expose exactly one anonymous window owner');
assert.strictEqual((html.match(/function reactToNote\(/g) || []).length, 0, 'inline reactToNote must be absent');
assert.strictEqual((html.match(/src\/features\/notes-reaction-owner\.js/g) || []).length, 1, 'module linkage must occur exactly once');
assert(html.indexOf('src/features/note-reactors-list-owner.js') < html.indexOf('src/features/notes-reaction-owner.js'), 'reaction owner must load after reactor-list owner');
assert(html.indexOf('src/features/notes-reaction-owner.js') < html.indexOf('src/features/note-viewer-owners.js'), 'reaction owner must load before Note viewer callers');
assert(authorization.includes('FEATURE_AUTHORIZATION=BOUNDED_REACT_TO_NOTE_EXTRACTION'), 'authorization marker missing');
assert(authorization.includes('LIVE_DATABASE_WRITES=0'), 'live-write exclusion missing');

function makeNode(id) { return { id, style: {}, textContent: '', removed: false, remove() { this.removed = true; } }; }
async function run(ownerSource, mode, clicked) {
  const events = []; const buttons = [makeNode('emoji-1'), makeNode('emoji-2')]; const timers = []; const rafs = []; const dbCalls = []; let now = 0; let burst = null;
  const document = { body: { appendChild(node) { events.push(`dom.append:${node.id}`); burst = node; } }, querySelectorAll(selector) { assert.strictEqual(selector, '.note-react-emoji'); return buttons; }, createElement(tag) { const node = makeNode(`${tag}-burst`); events.push(`dom.create:${tag}`); return node; } };
  const db = { from(table) { events.push(`db.from:${table}`); return { upsert(payload, options) { dbCalls.push({ table, payload, options }); events.push(`db.upsert:${table}`); return Promise.resolve({ error: mode === 'error' ? { message: 'synthetic failure' } : null }); } }; } };
  const context = { document, db, ME: { id: 'synthetic-user' }, navigator: { vibrate(value) { events.push(`navigator.vibrate:${value}`); } }, requestAnimationFrame(cb) { rafs.push(cb); }, setTimeout(cb, delay) { timers.push({ cb, due: now + delay }); return timers.length; }, toast(message) { events.push(`toast:${message}`); }, loadNotesBar() { events.push('loadNotesBar'); }, console: { error(message) { events.push(`console.error:${message}`); } } };
  const fn = vm.runInNewContext(`(${ownerSource})`, context); fn('note-123', '❤️', clicked ? buttons[0] : null);
  while (rafs.length) rafs.shift()(); await Promise.resolve();
  while (timers.length) { timers.sort((a, b) => a.due - b.due); const timer = timers.shift(); now = timer.due; timer.cb(); while (rafs.length) rafs.shift()(); await Promise.resolve(); }
  await Promise.resolve();
  return JSON.parse(JSON.stringify({ events, dbCalls, buttons: buttons.map(n => ({ id: n.id, style: n.style })), burst: burst && { id: burst.id, removed: burst.removed, style: burst.style }, timersRemaining: timers.length }));
}
(async () => {
  const success = await run(moduleOwner, 'success', true);
  assert(success.events.includes('loadNotesBar'), 'success must refresh Notes bar');
  assert.deepStrictEqual(success.dbCalls, [{ table: 'quick_note_reactions', payload: { note_id: 'note-123', user_id: 'synthetic-user', emoji: '❤️' }, options: { onConflict: 'note_id,user_id' } }], 'payload/conflict policy mismatch');
  assert.strictEqual(success.burst.removed, true, 'burst cleanup missing');
  assert.strictEqual(success.buttons[0].style.transform, 'scale(1)', 'clicked transform reset missing');
  assert.strictEqual(success.timersRemaining, 0, 'success timers must be empty');
  const noClicked = await run(moduleOwner, 'success', false);
  assert.deepStrictEqual(noClicked.buttons.map(n => n.style.background), ['transparent', 'transparent'], 'missing clicked element must remain safe');
  const error = await run(moduleOwner, 'error', true);
  assert(error.events.some(e => e.startsWith('console.error:Reaction save failed:')), 'error logging mismatch');
  assert(error.events.includes('toast:Reaction save nahi hua'), 'error toast mismatch');
  assert(!error.events.includes('loadNotesBar'), 'error must not refresh Notes bar');
  assert.strictEqual(error.timersRemaining, 0, 'error timers must be empty');
  const forbidden = [...success.events, ...noClicked.events, ...error.events].filter(e => /fetch|storage|permission|media|history|navigate|broadcast/i.test(e));
  assert.deepStrictEqual(forbidden, [], 'forbidden side effect detected');
  console.log('NOTES_REACTION_OWNER_PRODUCTION_SPLIT_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${sha(originOwner)}`);
  console.log('OWNER_BODY_PARITY=PASS');
  console.log('CLASSIC_GLOBAL_AND_SINGLE_LINKAGE=PASS');
  console.log('SUCCESS_ERROR_MISSING_ELEMENT=PASS');
  console.log('PAYLOAD_CONFLICT_POLICY=PASS');
  console.log('TIMING_CLEANUP_AND_SAFE_SIDE_EFFECTS=PASS');
  console.log('DATABASE_WRITE=MOCKED_SINGLE_UPSERT_ONLY');
  console.log('LIVE_DATABASE_WRITES=0');
  console.log('PRODUCTION_SPLIT=1_REACT_TO_NOTE_OWNER');
})();
