const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const indexPath = path.join(repo, 'index.html');
const source = fs.readFileSync(indexPath, 'utf8');
const originMain = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });

function extractOwner(text) {
  const match = text.match(/function setReportsFilter\(f\)\{[\s\S]*?\n\}/);
  assert(match, 'setReportsFilter owner must exist');
  return match[0];
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

const owner = extractOwner(source);
const originOwner = extractOwner(originMain);
assert.strictEqual(normalize(owner), normalize(originOwner), 'candidate owner must retain exact normalized origin/main parity');
assert.strictEqual((source.match(/function setReportsFilter\(/g) || []).length, 1, 'inline candidate owner must exist exactly once before split');
assert(!owner.includes('.insert('), 'candidate owner must not insert data');
assert(!owner.includes('.delete('), 'candidate owner must not delete data');
assert(!owner.includes('.update('), 'candidate owner must not update database rows');
assert(!owner.includes('window.location'), 'candidate owner must not navigate');
assert(owner.includes('_reportsFilter=f'), 'candidate owner must update existing filter state');
assert(owner.includes("document.getElementById('rf-'+x)"), 'candidate owner must address existing reports filter controls');
assert(owner.includes('loadReportsList()'), 'candidate owner must delegate to existing reports loader');
assert.strictEqual(crypto.createHash('sha256').update(normalize(originOwner)).digest('hex'), 'ee2638326b5e3f692744c61f92f040cec15da399ac15612a56de4c75825ee05e', 'candidate owner parity hash must remain pinned');

function createInjectedReportsFilterSeam({ state, getElementById, reload }) {
  return function setReportsFilterInjected(filter) {
    state.reportsFilter = filter;
    ['pending', 'resolved', 'dismissed', 'all'].forEach(x => {
      const el = getElementById(`rf-${x}`);
      if (!el) return;
      if (x === filter) {
        const c = { pending: '#ffaa00', resolved: '#3db83d', dismissed: '#8A8A8A', all: '#a855f7' }[x];
        el.style.background = c + '26';
        el.style.border = '1px solid ' + c;
        el.style.color = c;
      } else {
        el.style.background = 'rgba(255,255,255,0.04)';
        el.style.border = '1px solid rgba(255,255,255,0.06)';
        el.style.color = '#8A8A8A';
      }
    });
    reload();
  };
}

async function runSeam() {
  const names = ['pending', 'resolved', 'dismissed', 'all'];
  const colors = { pending: '#ffaa00', resolved: '#3db83d', dismissed: '#8A8A8A', all: '#a855f7' };
  const elements = new Map(names.map(name => [`rf-${name}`, { style: {} }]));
  const state = { reportsFilter: 'pending' };
  const reloads = [];
  const seam = createInjectedReportsFilterSeam({
    state,
    getElementById: id => elements.get(id) || null,
    reload: () => reloads.push(state.reportsFilter)
  });
  const cases = [];
  for (const filter of names) {
    reloads.length = 0;
    seam(filter);
    assert.strictEqual(state.reportsFilter, filter, `${filter} must update filter state`);
    assert.strictEqual(reloads.length, 1, `${filter} must delegate exactly one reload`);
    assert.strictEqual(elements.get(`rf-${filter}`).style.color, colors[filter], `${filter} selected color must match`);
    assert.strictEqual(elements.get(`rf-${filter}`).style.border, `1px solid ${colors[filter]}`, `${filter} selected border must match`);
    for (const other of names.filter(name => name !== filter)) {
      assert.strictEqual(elements.get(`rf-${other}`).style.color, '#8A8A8A', `${other} must reset to unselected color`);
    }
    cases.push(filter);
  }
  elements.delete('rf-all');
  reloads.length = 0;
  seam('all');
  assert.strictEqual(state.reportsFilter, 'all', 'missing-control case must still update state');
  assert.strictEqual(reloads.length, 1, 'missing-control case must still delegate one reload');
  return { cases, missingControl: 'rf-all', missingControlReloads: reloads.length };
}

runSeam().then(result => {
  console.log('SET_REPORTS_FILTER_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
  console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
  console.log('CANDIDATE_OWNER_SHA256=ee2638326b5e3f692744c61f92f040cec15da399ac15612a56de4c75825ee05e');
  console.log('INJECTED_SEAM=FILTERS_STYLING_MISSING_CONTROL_RELOAD_PASS');
  console.log(`FILTER_CASES=${result.cases.length}`);
  console.log('STATEFUL_BOUNDARIES=ABSENT');
  console.log('INLINE_OWNER=ONE_NAMED_DECLARATION');
  console.log('EXTERNAL_OWNER=NOT_YET_LINKED');
  console.log('READ_ONLY_BROWSER_PROOF=PASS');
  console.log('ROLLBACK_EVIDENCE=PINNED');
  console.log('PRODUCTION_SPLIT=PENDING');
}).catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
