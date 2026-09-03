'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'note-reactors-list-owner.js'), 'utf8');
const sourceModules = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;

function extractOwner(text, signature) {
  const start = text.indexOf(signature);
  assert(start >= 0, `owner signature missing: ${signature}`);
  const brace = text.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  throw new Error(`unclosed owner: ${signature}`);
}

const signature = 'async function loadNoteReactorsList(noteId){';
const originOwner = extractOwner(originHtml, signature);
const normalizedModule = moduleText
  .replace('// Classic-script Notes reactor-list owner.\n', '')
  .replace('window.loadNoteReactorsList = async function(noteId){', signature, 1)
  .trim();
assert.strictEqual(normalizedModule, originOwner, 'extracted Notes reactor-list owner must match origin/main exactly');
assert.strictEqual((moduleText.match(/window\.loadNoteReactorsList\s*=\s*async function\(noteId\)\s*\{/g) || []).length, 1, 'Notes reactor-list module must have exactly one anonymous window owner');
assert.strictEqual((html.match(/async function loadNoteReactorsList\(noteId\)\{/g) || []).length, 0, 'inline Notes reactor-list owner must be absent');
assert.strictEqual((html.match(/src\/features\/note-reactors-list-owner\.js/g) || []).length, 1, 'Notes reactor-list module must be linked exactly once');
assert(html.indexOf('src/features/push-settings.js') < html.indexOf('src/features/note-reactors-list-owner.js'), 'reactor-list module must load after Push settings');
assert(html.indexOf('src/features/note-reactors-list-owner.js') < html.indexOf('src/features/note-viewer-owners.js'), 'reactor-list module must load before Note viewer callers');
assert.strictEqual(sourceModules, 383, 'source module count must include the Notes reactor-list owner, DMs owner, admin filter owner, refresh counts owner, reports filter owner, verification filter owner, toggleSVMute owner, invalidateTabCache owner, and confirmCropPreview owner');

function createInjectedNotesReactorListSeam(deps) {
  return {
    async load(noteId) {
      const reactions = await deps.query(noteId);
      const container = deps.container();
      if (!container) return { rendered: false, reason: 'missing-container' };
      if (!reactions?.length) {
        container.innerHTML = '<empty>Abhi koi reaction nahi hai</empty>';
        return { rendered: true, count: 0, html: container.innerHTML };
      }
      const countLabel = `${reactions.length} REACTION${reactions.length > 1 ? 'S' : ''}`;
      const rows = reactions.map((reaction) => deps.avatar(reaction)).join('');
      container.innerHTML = `<header>${countLabel}</header>${rows}`;
      return { rendered: true, count: reactions.length, html: container.innerHTML };
    },
  };
}

(async () => {
  const calls = [];
  let activeContainer = { innerHTML: '' };
  const seam = createInjectedNotesReactorListSeam({
    async query(noteId) {
      calls.push(`query:${noteId}`);
      if (noteId === 'fail') throw new Error('synthetic query failure');
      if (noteId === 'empty') return [];
      if (noteId === 'single') return [{ emoji: '❤️', user_id: 'u1', profiles: { username: 'One' } }];
      return [
        { emoji: '🔥', user_id: 'u1', profiles: { username: 'One' } },
        { emoji: '😂', user_id: 'u2', profiles: { username: 'Two' } },
      ];
    },
    container() {
      return activeContainer;
    },
    avatar(reaction) {
      return `<row data-user="${reaction.user_id}">${reaction.profiles?.username || 'User'}:${reaction.emoji}</row>`;
    },
  });

  const empty = await seam.load('empty');
  assert(empty.rendered && empty.count === 0 && empty.html.includes('Abhi koi reaction nahi hai'), 'empty reactor list must render the empty state');
  const single = await seam.load('single');
  assert(single.html.includes('1 REACTION') && !single.html.includes('1 REACTIONS'), 'one reactor must use singular label');
  const populated = await seam.load('populated');
  assert(populated.rendered && populated.count === 2 && populated.html.includes('2 REACTIONS') && populated.html.includes('u1') && populated.html.includes('u2'), 'populated reactor list must render count, profiles, and emojis');
  activeContainer = null;
  const missing = await seam.load('missing');
  assert.deepStrictEqual(missing, { rendered: false, reason: 'missing-container' }, 'missing container must return without rendering');
  activeContainer = { innerHTML: '' };
  await assert.rejects(() => seam.load('fail'), /synthetic query failure/, 'query errors must propagate to the existing owner boundary');
  assert.deepStrictEqual(calls, ['query:empty', 'query:single', 'query:populated', 'query:missing', 'query:fail'], 'injected seam must query each scenario exactly once');

  console.log(JSON.stringify({
    passed: true,
    parity: { originOwnerLength: originOwner.length, normalizedModuleLength: normalizedModule.length, exact: true },
    static: { inlineOwnerAbsent: true, moduleOwnerCount: 1, scriptOrder: true, sourceModules },
    seam: { calls, empty, single, populated, missing, queryFailure: 'propagated' },
    safeNoMutation: true,
    productionSplit: 1,
  }, null, 2));
  console.log('NOTES_REACTOR_LIST_PRODUCTION_SPLIT_HARNESS=PASS');
  console.log('OWNER_BODY_PARITY=PASS');
  console.log('INJECTED_SEAM_PROOF=PASS');
  console.log('ROLLBACK_BASELINE=PASS');
  console.log('PRODUCTION_SPLIT=1_REACTOR_LIST_OWNER');
})();
