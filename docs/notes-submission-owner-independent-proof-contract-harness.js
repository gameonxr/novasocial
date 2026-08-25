const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
const currentHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});
const contract = fs.readFileSync(path.join(repo, 'docs', 'notes-submission-owner-independent-proof-contract.md'), 'utf8');
const dossier = fs.readFileSync(path.join(repo, 'docs', 'notes-submission-reactions-protected-readiness-contract.md'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('async function submitNote(){');
  assert(start >= 0, 'submitNote owner declaration must exist');
  const end = text.indexOf('\n}\n', start);
  assert(end > start, 'submitNote owner boundary must be discoverable');
  return text.slice(start, end + 2);
}
function sha(value) {
  return crypto.createHash('sha256').update(value.replace(/\r\n/g, '\n')).digest('hex');
}
const currentOwner = extractOwner(currentHtml);
const originOwner = extractOwner(originHtml);
assert.strictEqual(currentOwner.replace(/\r\n/g, '\n'), originOwner.replace(/\r\n/g, '\n'), 'Branch2 submitNote owner must retain exact immutable-origin parity');
assert.strictEqual(currentHtml.split('async function submitNote(){').length - 1, 1, 'one inline submitNote owner must remain');
assert(!currentHtml.includes('src/features/notes-submission-owner.js'), 'production Notes submission owner must not be extracted');
assert(contract.includes('EXACT_ORIGIN_PARITY=REQUIRED'), 'contract must require exact parity');
assert(contract.includes('DETACHED_SYNTHETIC_PROOF=REQUIRED'), 'contract must require detached proof');
assert(contract.includes('PRODUCTION_DECISION=BLOCKED'), 'contract must keep production blocked');
assert(dossier.includes('PRODUCTION_DECISION=BLOCKED'), 'protected Notes dossier must remain blocked');

function stable(value) {
  return JSON.parse(JSON.stringify(value));
}

function runSubmission(ownerSource, mode) {
  const events = [];
  const calls = [];
  const timers = [];
  const now = 1700000000000;
  const noteInput = { value: mode === 'empty' ? '   ' : ' Hello Notes ' };
  const elements = new Map([['note-text-inp', noteInput]]);
  const document = {
    getElementById(id) { events.push(`dom.get:${id}`); return elements.get(id) || null; }
  };
  const db = {
    from(table) {
      events.push(`db.from:${table}`);
      assert.strictEqual(table, 'quick_notes');
      const chain = {
        update(payload) {
          calls.push({ operation: 'update', payload });
          events.push('db.update');
          return chain;
        },
        insert(payload) {
          calls.push({ operation: 'insert', payload });
          events.push('db.insert');
          return chain;
        },
        eq(column, value) {
          calls.push({ operation: 'eq', column, value });
          events.push(`db.eq:${column}:${value}`);
          return chain;
        },
        select() {
          calls.push({ operation: 'select' });
          events.push('db.select');
          const failed = mode === 'insert-error' || mode === 'update-error';
          return Promise.resolve({ data: failed ? null : [{ id: 'synthetic-note' }], error: failed ? { message: `synthetic ${mode}` } : null });
        }
      };
      return chain;
    }
  };
  const context = {
    document,
    db,
    window: { _noteMusic: null, _noteVisibility: 'private' },
    _myActiveNote: mode === 'update' || mode === 'update-error' ? { id: 'active-note-7' } : null,
    ME: { id: 'synthetic-user' },
    Date: class SyntheticDate extends Date { static now() { return now; } },
    setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length; },
    toast(message) { events.push(`toast:${message}`); },
    closeModal() { events.push('closeModal'); },
    loadNotesBar() { events.push('loadNotesBar'); },
    console: { log() {}, error() {} }
  };
  const fn = vm.runInNewContext(`(${ownerSource})`, context);
  return fn().then(() => stable({ events, calls, timers, activeNote: context._myActiveNote }));
}

(async () => {
  const modes = ['empty', 'insert', 'update', 'insert-error', 'update-error'];
  const results = {};
  for (const mode of modes) {
    const before = await runSubmission(originOwner, mode);
    const after = await runSubmission(currentOwner, mode);
    assert.deepStrictEqual(after, before, `${mode} before/after trace must match`);
    results[mode] = before;
  }

  assert.deepStrictEqual(results.empty.calls, [], 'empty validation must not persist');
  assert(results.empty.events.includes('toast:Text likho ya gaana lagao'), 'empty validation toast must remain');
  assert(!results.empty.events.includes('closeModal'), 'empty validation must not close modal');

  assert.deepStrictEqual(results.insert.calls, [
    { operation: 'insert', payload: {
      user_id: 'synthetic-user', text: 'Hello Notes', music_title: null, music_artist: null,
      music_artwork: null, music_preview_url: null, music_start_sec: 0, visibility: 'private'
    } },
    { operation: 'select' }
  ], 'new submission payload must remain exact');
  assert(results.insert.events.indexOf('toast:Note shared! ✨') < results.insert.events.indexOf('closeModal'), 'success toast must precede modal close');
  assert(results.insert.events.indexOf('closeModal') < results.insert.events.indexOf('loadNotesBar'), 'modal close must precede Notes-bar refresh');
  assert.strictEqual(results.insert.events.filter(event => event === 'closeModal').length, 1, 'insert success must close once');
  assert.strictEqual(results.insert.events.filter(event => event === 'loadNotesBar').length, 1, 'insert success must refresh once');

  assert.deepStrictEqual(results.update.calls, [
    { operation: 'update', payload: {
      text: 'Hello Notes', music_title: null, music_artist: null, music_artwork: null,
      music_preview_url: null, music_start_sec: 0, visibility: 'private', expires_at: new Date(1700000000000 + 24 * 60 * 60 * 1000).toISOString()
    } },
    { operation: 'eq', column: 'id', value: 'active-note-7' },
    { operation: 'select' }
  ], 'active-note update payload and filter must remain exact');
  assert(results.update.events.includes('closeModal'), 'update success must close modal');
  assert(results.update.events.includes('loadNotesBar'), 'update success must refresh Notes bar');

  for (const mode of ['insert-error', 'update-error']) {
    assert(results[mode].events.some(event => event.startsWith('toast:Failed: synthetic')), `${mode} must show failure toast`);
    assert(!results[mode].events.includes('closeModal'), `${mode} must not close modal`);
    assert(!results[mode].events.includes('loadNotesBar'), `${mode} must not refresh Notes bar`);
  }

  const forbidden = Object.values(results).flatMap(result => result.events).filter(event => /fetch|storage|permission|upload|media|history|navigate|broadcast/i.test(event));
  assert.deepStrictEqual(forbidden, [], 'submission proof must not perform forbidden live effects');

  console.log('NOTES_SUBMISSION_OWNER_INDEPENDENT_PROOF_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${sha(originOwner)}`);
  console.log('OWNER_PARITY=PASS');
  console.log('EMPTY_VALIDATION_BEFORE_AFTER=PASS');
  console.log('INSERT_SUCCESS_BEFORE_AFTER=PASS');
  console.log('UPDATE_SUCCESS_BEFORE_AFTER=PASS');
  console.log('INSERT_ERROR_BEFORE_AFTER=PASS');
  console.log('UPDATE_ERROR_BEFORE_AFTER=PASS');
  console.log('PAYLOAD_VISIBILITY_EXPIRY=PASS');
  console.log('SUCCESS_UI_ORDER=PASS');
  console.log('ERROR_ROLLBACK_UI=PASS');
  console.log('DATABASE_WRITES=MOCKED_ONLY');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('STORAGE_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('UPLOADS=0');
  console.log('PERMISSION_REQUESTS=0');
  console.log('LIVE_NAVIGATION=0');
  console.log('REAL_MEDIA_ACCESS=0');
  console.log('PRODUCTION_SPLIT=0');
})();
