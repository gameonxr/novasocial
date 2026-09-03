'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDocument = global.document;
  const originalDb = global.db;
  const originalEsc = global.esc;
  const originalAv = global.av;

  const elements = new Map();
  const calls = [];
  let tableResult = { data: [], error: null };
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.av = (avatar, username, size) => `[av:${username}:${size}]`;
  global.document = { getElementById: id => elements.get(id) || null };

  function configureDb(result) {
    calls.length = 0;
    tableResult = result;
    global.db = { from(table) {
      calls.push(['from', table]);
      const builder = {
        select(...args) { calls.push(['select', ...args]); return builder; },
        order(...args) { calls.push(['order', ...args]); return builder; },
        limit(...args) { calls.push(['limit', ...args]); return builder; },
        eq(...args) { calls.push(['eq', ...args]); return builder; },
        then(resolve, reject) { return Promise.resolve(tableResult).then(resolve, reject); },
        catch(reject) { return Promise.resolve(tableResult).catch(reject); }
      };
      return builder;
    } };
  }

  function resetElements() {
    elements.clear();
    const list = { innerHTML: '' };
    elements.set('admin-appeals-list', list);
    for (const key of ['pending', 'approved', 'rejected', 'all']) elements.set('apf-' + key, { style: {} });
    return list;
  }

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function adminTabAppeals(content){');
    const end = source.indexOf('\nasync function adminApproveAppeal(', start);
    assert(start >= 0 && end > start, 'appeals tab function boundary must remain present and ordered');
    const functionBlock = source.slice(start, end);
    const moduleOwner = fs.readFileSync('/home/z/my-project/novasocial/src/features/admin-appeals-filter-owner.js', 'utf8');
    eval(`let _appealsFilter = 'pending'; const window = global; ${functionBlock}; ${moduleOwner}; global.adminTabAppeals = adminTabAppeals; global.setAppealsFilter = window.setAppealsFilter; global.loadAppealsList = loadAppealsList;`);

    const appeal = {
      id: 'a1', user_id: 'u1', appeal_reason: 'Please review <reason>', status: 'pending', admin_notes: null,
      created_at: '2026-03-05T00:00:00Z', profiles: { username: "appealer'", avatar_url: 'a', ban_reason: 'Repeated <spam>' }
    };
    const list = resetElements();
    configureDb({ data: [appeal], error: null });
    const content = { innerHTML: '' };
    await global.adminTabAppeals(content);
    assert(content.innerHTML.includes('apf-pending') && content.innerHTML.includes('apf-all'), 'appeals tab renders all filter controls');
    assert(calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'pending'), 'pending status filter is applied');
    assert(list.innerHTML.includes('appealer'), 'embedded profile username renders');
    assert(list.innerHTML.includes('Banned: Repeated &lt;spam&gt;'), 'ban reason is escaped and rendered');
    assert(list.innerHTML.includes('Please review &lt;reason&gt;'), 'appeal reason is escaped');
    assert(list.innerHTML.includes('Approve (Unban)') && list.innerHTML.includes('Reject'), 'pending appeal actions render');
    assert(list.innerHTML.includes("adminApproveAppeal('a1','u1'"), 'approve handler retains appeal and user ids');

    // Approved filter hides pending actions and applies selected styling.
    resetElements();
    configureDb({ data: [{ ...appeal, status: 'approved' }], error: null });
    global.setAppealsFilter('approved');
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(elements.get('apf-approved').style.color, '#3db83d', 'approved filter receives selected styling');
    assert(!elements.get('admin-appeals-list').innerHTML.includes('Approve (Unban)'), 'approved appeal has no approve action');
    assert(!elements.get('admin-appeals-list').innerHTML.includes('>Reject<'), 'approved appeal has no reject action');

    // All filter omits status equality and preserves rejected status.
    resetElements();
    configureDb({ data: [{ ...appeal, status: 'rejected', profiles: { username: 'appealer', avatar_url: null, ban_reason: null } }], error: null });
    global.setAppealsFilter('all');
    await new Promise(resolve => setImmediate(resolve));
    assert(!calls.some(call => call[0] === 'eq' && call[1] === 'status'), 'all filter omits status equality');
    assert(elements.get('admin-appeals-list').innerHTML.includes('rejected'), 'rejected status is rendered');
    assert(!elements.get('admin-appeals-list').innerHTML.includes('Banned:'), 'missing ban reason does not render the reason line');

    // Empty and failure states remain stable.
    resetElements();
    configureDb({ data: [], error: null });
    await global.loadAppealsList();
    assert(elements.get('admin-appeals-list').innerHTML.includes('No all appeals'), 'empty state includes current filter');
    configureDb({ data: null, error: new Error('appeals unavailable') });
    await global.loadAppealsList();
    assert(elements.get('admin-appeals-list').innerHTML.includes('Failed: appeals unavailable'), 'failure state renders safe message');

    console.log('ADMIN_APPEALS_TAB_HARNESS=PASS');
  } finally {
    global.document = originalDocument;
    global.db = originalDb;
    global.esc = originalEsc;
    global.av = originalAv;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
