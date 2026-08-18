'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDocument = global.document;
  const originalDb = global.db;
  const originalME = global.ME;
  const originalEsc = global.esc;
  const originalAv = global.av;

  const elements = new Map();
  const calls = [];
  let tableResult = { data: [], error: null };
  global.ME = { id: 'moderator-1' };
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
        eq(...args) { calls.push(['eq', ...args]); return builder; },
        order(...args) { calls.push(['order', ...args]); return builder; },
        limit(...args) { calls.push(['limit', ...args]); return builder; },
        then(resolve, reject) { return Promise.resolve(tableResult).then(resolve, reject); },
        catch(reject) { return Promise.resolve(tableResult).catch(reject); }
      };
      return builder;
    } };
  }

  function resetElements() {
    elements.clear();
    const adminList = { innerHTML: '' };
    const myList = { innerHTML: '' };
    elements.set('admin-approvals-list', adminList);
    elements.set('admin-myapprovals-list', myList);
    return { adminList, myList };
  }

  try {
    const source = fs.readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function adminTabApprovals(content){');
    const end = source.indexOf('\n\n// ═══════════════════════════════════════════════════════════════\n// 🔍 DIAGNOSTIC FUNCTION', start);
    assert(start >= 0 && end > start, 'approval-tab boundary must remain present and ordered');
    const fnSource = source.slice(start, end);
    eval(`${fnSource}; global.adminTabApprovals = adminTabApprovals; global.adminTabMyApprovals = adminTabMyApprovals;`);

    // Admin pending approvals render moderator, target, reason, and decision actions.
    const { adminList } = resetElements();
    const pending = {
      id: 'approval-1', moderator_id: 'moderator-2', target_user_id: 'target-1', reason: 'Reason <unsafe>',
      target_type: 'user', target_id: null, status: 'pending', admin_notes: null, created_at: '2026-03-11T00:00:00Z', reviewed_at: null,
      profiles: { username: "mod'", avatar_url: 'm' }, target_profile: { username: "target'", avatar_url: 't', is_banned: true }
    };
    configureDb({ data: [pending], error: null });
    const content = { innerHTML: '' };
    await global.adminTabApprovals(content);
    assert(content.innerHTML.includes('admin-approvals-list'), 'admin approval list container renders');
    assert(calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'pending'), 'admin approval query is pending-only');
    assert(adminList.innerHTML.includes("Recommended by @mod"), 'recommending moderator renders');
    assert(adminList.innerHTML.includes('@target'), 'target profile renders');
    assert(adminList.innerHTML.includes('Already banned'), 'existing target ban marker renders');
    assert(adminList.innerHTML.includes('Reason &lt;unsafe&gt;'), 'recommendation reason is escaped');
    assert(adminList.innerHTML.includes('Approve Ban') && adminList.innerHTML.includes('Reject'), 'pending approval actions render');
    assert(adminList.innerHTML.includes("adminApproveBan('approval-1','target-1'"), 'approve handler retains approval and target ids');

    // Empty admin approvals and failure state.
    resetElements();
    configureDb({ data: [], error: null });
    await global.adminTabApprovals(content);
    assert(elements.get('admin-approvals-list').innerHTML.includes('No pending ban approvals'), 'admin empty state renders');
    configureDb({ data: null, error: new Error('approval query failed') });
    await global.adminTabApprovals(content);
    assert(elements.get('admin-approvals-list').innerHTML.includes('Failed: approval query failed'), 'admin failure state renders');

    // Moderator own requests render status, reason, admin notes, and target profile.
    const { myList } = resetElements();
    const own = { id: 'approval-2', target_user_id: 'target-2', reason: 'Own reason <unsafe>', status: 'rejected', admin_notes: 'Admin note <x>', created_at: '2026-03-12T00:00:00Z', reviewed_at: '2026-03-13T00:00:00Z', profiles: { username: 'target-two', avatar_url: null } };
    configureDb({ data: [own], error: null });
    const myContent = { innerHTML: '' };
    await global.adminTabMyApprovals(myContent);
    assert(myContent.innerHTML.includes('admin-myapprovals-list'), 'moderator requests list container renders');
    assert(calls.some(call => call[0] === 'eq' && call[1] === 'moderator_id' && call[2] === 'moderator-1'), 'own requests are filtered to current moderator');
    assert(myList.innerHTML.includes('@target-two'), 'own request target renders');
    assert(myList.innerHTML.includes('rejected'), 'request status renders');
    assert(myList.innerHTML.includes('Own reason &lt;unsafe&gt;'), 'own reason is escaped');
    assert(myList.innerHTML.includes('Admin: Admin note &lt;x&gt;'), 'admin notes are escaped and rendered');

    // Empty own requests and failure state.
    resetElements();
    configureDb({ data: [], error: null });
    await global.adminTabMyApprovals(myContent);
    assert(elements.get('admin-myapprovals-list').innerHTML.includes('You have not made any ban recommendations'), 'own-request empty state renders');
    configureDb({ data: null, error: new Error('own request failed') });
    await global.adminTabMyApprovals(myContent);
    assert(elements.get('admin-myapprovals-list').innerHTML.includes('Failed: own request failed'), 'own-request failure state renders');

    console.log('ADMIN_APPROVAL_TABS_HARNESS=PASS');
  } finally {
    global.document = originalDocument;
    global.db = originalDb;
    global.ME = originalME;
    global.esc = originalEsc;
    global.av = originalAv;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
