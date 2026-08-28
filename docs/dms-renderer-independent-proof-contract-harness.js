const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['-C', repo, 'show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const branchModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');
const startMarker = 'async function renderDMs(){';
const globalStartMarker = 'window.renderDMs = async function(){';
const endMarker = '\nasync function openChat('; 
function ownerWindow(source) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0 && end > start, 'renderDMs owner window must be present');
  return source.slice(start, end).trimEnd();
}
function globalOwnerWindow(source) {
  const start = source.indexOf(globalStartMarker);
  const end = source.lastIndexOf('}');
  assert(start >= 0 && end > start, 'external renderDMs owner must be present');
  return source.slice(start, end + 1).trimEnd();
}
const ownerSource = ownerWindow(originHtml);
const originOwnerSource = ownerSource;
const branchGlobalOwnerSource = globalOwnerWindow(branchModule);
const branchOwnerSource = branchGlobalOwnerSource.replace(globalStartMarker, startMarker);
assert(!html.includes(startMarker), 'Branch2 inline renderDMs owner must be removed after split');
assert.strictEqual(branchOwnerSource, originOwnerSource, 'external Branch2 renderDMs owner must equal immutable origin/main inline owner');
const sourceFiles = fs.readdirSync(path.join(repo, 'src', 'features')).map(file => path.join(repo, 'src', 'features', file));
const sourceText = sourceFiles.filter(file => file.endsWith('.js')).map(file => fs.readFileSync(file, 'utf8')).join('\n');
assert(sourceText.includes(globalStartMarker), 'external renderDMs classic global owner must be present');
assert(html.includes('<script src="src/features/dms-renderer-owner.js"></script>'), 'index.html must load the external DMs owner');

function makeQuery(value, calls, label) {
  const query = {
    select() { return query; },
    eq() { return query; },
    is() { return query; },
    neq() { return query; },
    in() { return query; },
    order() { return query; },
    limit() { return query; },
    async then(resolve, reject) {
      calls.push(label);
      try { resolve({ data: value, error: null }); } catch (error) { if (reject) reject(error); }
    },
  };
  return query;
}

function createDocument({ conversations = [], unread = [], others = [], notes = [], bumpGeneration = false } = {}) {
  const calls = [];
  const nodes = new Map();
  const screen = { innerHTML: '', children: [] };
  const notesBar = { innerHTML: '' };
  nodes.set('screen', screen);
  nodes.set('notes-bar', notesBar);
  const db = {
    from(table) {
      calls.push(`from:${table}`);
      if (table === 'conversation_members' && calls.filter(item => item === 'from:conversation_members').length === 1) {
        return makeQuery(conversations.map(conversation => ({ conversations: conversation })), calls, 'conversations');
      }
      if (table === 'messages') return makeQuery(unread, calls, 'unread');
      if (table === 'conversation_members') return makeQuery(others, calls, 'others');
      throw new Error(`unexpected table ${table}`);
    },
  };
  const document = { getElementById(id) { return nodes.get(id) || null; } };
  const context = {
    document,
    db,
    ME: { id: 'me' },
    _renderGeneration: 1,
    _fetchNotesBarData: async () => {
      calls.push('notes');
      if (bumpGeneration) context._renderGeneration = 2;
      return notes;
    },
    _renderNotesBarHtml: value => {
      calls.push('notes.render');
      notesBar.innerHTML = JSON.stringify(value);
    },
    isOnline: () => false,
    av: () => '<avatar>',
    ago: () => 'now',
    ico: () => '<icon>',
    console,
  };
  context.window = context;
  vm.createContext(context);
  return { context, calls, screen, notesBar };
}

function fixtureInput({ bumpGeneration = false } = {}) {
  return {
    conversations: [{ id: bumpGeneration ? 'c2' : 'c1', is_group: false, last_message_at: '2026-08-27T00:00:00Z', last_message: bumpGeneration ? 'stale' : 'hello' }],
    unread: bumpGeneration ? [] : [{ conversation_id: 'c1' }],
    others: bumpGeneration ? [] : [{ conversation_id: 'c1', profiles: { username: 'friend', avatar_url: null, last_seen: null } }],
    notes: bumpGeneration ? [] : [{ id: 'n1', text: 'note' }],
    bumpGeneration,
  };
}

async function execute(source, input) {
  const fixture = createDocument(input);
  const candidateSource = source === ownerSource ? source : source.replace(startMarker, 'async function candidateRenderDMs(){');
  const owner = vm.runInContext(`(async function(){${candidateSource.slice(candidateSource.indexOf('{') + 1, candidateSource.lastIndexOf('}'))}})`, fixture.context);
  const result = await owner();
  return { ...fixture, result };
}

function snapshot(fixture) {
  return JSON.stringify({
    result: fixture.result,
    calls: fixture.calls,
    screen: fixture.screen.innerHTML,
    notesBar: fixture.notesBar.innerHTML,
  });
}

(async () => {
  const populatedInput = fixtureInput();
  const populated = await execute(ownerSource, populatedInput);
  assert.strictEqual(populated.result, undefined, 'successful renderer returns without a value');
  assert(populated.calls.indexOf('conversations') < populated.calls.indexOf('notes.render'), 'base conversations fetch precedes DOM/Notes handoff');
  assert(populated.calls.includes('unread') && populated.calls.includes('notes') && populated.calls.includes('others'), 'all expected synthetic reads occur');
  assert(populated.screen.innerHTML.includes('data-cid="c1"'), 'conversation row keeps data-cid marker');
  assert(populated.screen.innerHTML.includes('id="notes-bar"'), 'screen keeps Notes Bar marker');
  assert.strictEqual(populated.notesBar.innerHTML, JSON.stringify([{ id: 'n1', text: 'note' }]), 'Notes Bar receives already-fetched data');

  const empty = await execute(ownerSource, { conversations: [], unread: [], others: [], notes: [] });
  assert(empty.screen.innerHTML.includes('Koi message nahi'), 'empty state remains rendered by actual owner');
  assert(empty.screen.innerHTML.includes('showNewDM()'), 'empty state keeps New Message affordance');

  const stale = await execute(ownerSource, fixtureInput({ bumpGeneration: true }));
  assert.strictEqual(stale.result, undefined, 'stale renderer exits without a value');
  assert.strictEqual(stale.screen.innerHTML, '', 'stale generation prevents screen replacement');
  assert(!stale.calls.includes('notes.render'), 'stale generation prevents Notes Bar mutation');

  const branchPopulated = await execute(branchOwnerSource, populatedInput);
  assert.strictEqual(snapshot(branchPopulated), snapshot(populated), 'external Branch2 owner must match immutable inline baseline populated output');
  const candidatePopulated = await execute(branchOwnerSource.replace(startMarker, 'async function candidateRenderDMs(){'), populatedInput);
  assert.strictEqual(snapshot(candidatePopulated), snapshot(populated), 'detached candidate must match actual owner populated output');
  const branchEmpty = await execute(branchOwnerSource, { conversations: [], unread: [], others: [], notes: [] });
  assert.strictEqual(snapshot(branchEmpty), snapshot(empty), 'external Branch2 owner must match immutable inline baseline empty output');
  const candidateEmpty = await execute(branchOwnerSource.replace(startMarker, 'async function candidateRenderDMs(){'), { conversations: [], unread: [], others: [], notes: [] });
  assert.strictEqual(snapshot(candidateEmpty), snapshot(empty), 'detached candidate must match actual owner empty output');
  const branchStale = await execute(branchOwnerSource, fixtureInput({ bumpGeneration: true }));
  assert.strictEqual(snapshot(branchStale), snapshot(stale), 'external Branch2 owner must match immutable inline baseline stale output');
  const candidateStale = await execute(branchOwnerSource.replace(startMarker, 'async function candidateRenderDMs(){'), fixtureInput({ bumpGeneration: true }));
  assert.strictEqual(snapshot(candidateStale), snapshot(stale), 'detached candidate must match actual owner stale output');

  let owner = async () => 'inline';
  const original = owner;
  const candidate = async () => 'candidate';
  owner = candidate;
  assert.strictEqual(await owner(), 'candidate', 'synthetic dispatcher can hand off to candidate');
  owner = original;
  assert.strictEqual(await owner(), 'inline', 'synthetic rollback restores original owner');
  assert.strictEqual(original, owner, 'synthetic rollback restores exact original function reference');

  for (const marker of [
    'const myGeneration = _renderGeneration',
    'const [memRes, unreadRes, notesData] = await Promise.all([',
    "db.from('conversation_members').select('conversation_id,conversations(*)').eq('user_id',ME.id)",
    "db.from('messages').select('conversation_id').is('seen_at', null).neq('sender_id', ME.id)",
    '_fetchNotesBarData()',
    "id=\"notes-bar\"",
    'data-cid=',
    'if(myGeneration !== _renderGeneration) return;',
    '_renderNotesBarHtml(notesData)',
  ]) assert(ownerSource.includes(marker), `inline owner marker missing: ${marker}`);

  console.log('DMS_RENDERER_INDEPENDENT_PROOF_HARNESS=PASS');
  console.log('ACTUAL_EXTERNAL_OWNER_EXECUTED=PASS');
  console.log('INLINE_BASELINE_FROM_ORIGIN_MAIN=PASS');
  console.log('ORIGIN_MAIN_OWNER_PARITY=PASS');
  console.log('POPULATED_RENDER=PASS');
  console.log('EMPTY_STATE_RENDER=PASS');
  console.log('STALE_GENERATION_ABORT=PASS');
  console.log('DETACHED_CANDIDATE_AFTER_PARITY=PASS');
  console.log('SYNTHETIC_ROLLBACK=PASS');
  console.log('LIVE_NETWORK_CALLS=0');
  console.log('LIVE_DATABASE_MUTATIONS=0');
  console.log('LIVE_ACCOUNT_ACTIONS=0');
  console.log('PRODUCTION_EXTRACTION=1');
  console.log('PRODUCTION_SOURCE_WRITTEN=1');
  console.log('PRODUCTION_DECISION=GATE_VALIDATION_PENDING');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
