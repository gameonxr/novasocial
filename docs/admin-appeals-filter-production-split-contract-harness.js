
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
const branch2Html = fs.readFileSync(`${repo}/index.html`, 'utf8');
const mainHtml = execFileSync('git', ['-C', repo, 'show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  if (start < 0) return null;
  let depth = 0;
  let quote = null;
  let escape = false;
  const open = source.indexOf('{', start);
  for (let i = open; i < source.length; i += 1) {
    const c = source[i];
    if (quote) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function createInjectedAppealsFilterSeam({ state, getElementById, reload }) {
  return function setAppealsFilter(filter) {
    state.appealsFilter = filter;
    ['pending', 'approved', 'rejected', 'all'].forEach((name) => {
      const element = getElementById(`apf-${name}`);
      if (!element) return;
      if (name === filter) {
        const color = { pending: '#ff8800', approved: '#3db83d', rejected: '#ff4444', all: '#a855f7' }[name];
        element.style.background = `${color}26`;
        element.style.border = `1px solid ${color}`;
        element.style.color = color;
      } else {
        element.style.background = 'rgba(255,255,255,0.04)';
        element.style.border = '1px solid rgba(255,255,255,0.06)';
        element.style.color = '#8A8A8A';
      }
    });
    reload();
  };
}

const signature = 'function setAppealsFilter(f){';
const branch2Owner = extractFunction(branch2Html, signature);
const mainOwner = extractFunction(mainHtml, signature);
assert(branch2Owner && mainOwner, 'setAppealsFilter owner must exist in Branch2 and origin/main during preparation');
assert.strictEqual(branch2Html.split(signature).length - 1, 1, 'Branch2 must retain exactly one inline candidate owner during preparation');
assert.strictEqual(mainHtml.split(signature).length - 1, 1, 'origin/main must contain exactly one candidate owner');
assert.strictEqual(branch2Owner, mainOwner, 'candidate owner must match origin/main exactly');
assert.strictEqual(crypto.createHash('sha256').update(branch2Owner).digest('hex'), 'a3b2effec6514e6d5a6b951e7d0295e81064145714d70d46654fd442e8bcdef1', 'candidate owner hash must remain pinned');
for (const marker of ['_appealsFilter=f', "getElementById('apf-'", 'loadAppealsList();']) {
  assert(branch2Owner.includes(marker), `candidate owner marker must remain present: ${marker}`);
}
assert(!/\.insert\s*\(|\.update\s*\(|\.upsert\s*\(|\.delete\s*\(|\.rpc\s*\(|fetch\s*\(|sendMessage|sendCmt|upload|getUserMedia|MediaRecorder|pushManager|permission|localStorage|sessionStorage|navigator\.serviceWorker|location\.|history\.|window\.open|confirm\s*\(|alert\s*\(/i.test(branch2Owner), 'candidate must remain free of stateful, external, permission, storage, navigation, and confirmation boundaries');
const sourceFiles = execFileSync('find', [`${repo}/src`, '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
assert(!sourceText.includes(signature), 'candidate must remain inline during preparation');
assert(branch2Html.includes('async function loadAppealsList(){'), 'existing read-only reload owner must remain inline');
assert(branch2Html.includes('async function adminApproveAppeal(') && branch2Html.includes('async function adminRejectAppeal('), 'appeal mutation owners must remain inline');

async function runSeam() {
  const elements = new Map();
  for (const name of ['pending', 'approved', 'rejected', 'all']) elements.set(`apf-${name}`, { style: {} });
  const state = { appealsFilter: 'pending' };
  const reloads = [];
  const seam = createInjectedAppealsFilterSeam({
    state,
    getElementById: id => elements.get(id) || null,
    reload: () => reloads.push(state.appealsFilter)
  });
  const colors = { pending: '#ff8800', approved: '#3db83d', rejected: '#ff4444', all: '#a855f7' };
  for (const filter of Object.keys(colors)) {
    reloads.length = 0;
    seam(filter);
    assert.strictEqual(state.appealsFilter, filter, `${filter} filter must update local state`);
    assert.strictEqual(reloads.length, 1, `${filter} filter must delegate exactly one reload`);
    assert.strictEqual(elements.get(`apf-${filter}`).style.color, colors[filter], `${filter} filter must receive selected color`);
    for (const other of Object.keys(colors).filter(name => name !== filter)) {
      assert.strictEqual(elements.get(`apf-${other}`).style.color, '#8A8A8A', `${other} filter must reset to unselected color`);
    }
  }
  elements.delete('apf-rejected');
  reloads.length = 0;
  seam('rejected');
  assert.strictEqual(reloads.length, 1, 'missing filter control must not block one reload delegation');
  assert.strictEqual(state.appealsFilter, 'rejected', 'missing filter control must still update local state');
  return { filters: Object.keys(colors), reloadsAfterMissingControl: reloads.length, missingControl: 'apf-rejected' };
}

runSeam().then(result => {
  console.log('ADMIN_APPEALS_FILTER_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
  console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
  console.log('CANDIDATE_OWNER_SHA256=a3b2effec6514e6d5a6b951e7d0295e81064145714d70d46654fd442e8bcdef1');
  console.log('INJECTED_SEAM=FILTERS_STYLING_MISSING_CONTROL_RELOAD_PASS');
  console.log(`FILTER_CASES=${result.filters.length}`);
  console.log('STATEFUL_BOUNDARIES=ABSENT');
  console.log('INLINE_OWNER=RETAINED_PREPARATION_ONLY');
  console.log('PRODUCTION_SPLIT=0');
}).catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
