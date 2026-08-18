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
    elements.set('admin-verify-list', list);
    for (const key of ['pending', 'approved', 'rejected', 'all']) elements.set('vf-' + key, { style: {} });
    return list;
  }

  try {
    const source = fs.readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function adminTabVerify(content){');
    const end = source.indexOf('\nasync function adminApproveVerify(', start);
    assert(start >= 0 && end > start, 'verification tab function boundary must remain present and ordered');
    const functionBlock = source.slice(start, end);
    eval(`let _verifyFilter = 'pending'; ${functionBlock}; global.adminTabVerify = adminTabVerify; global.setVerifyFilter = setVerifyFilter; global.loadVerifyList = loadVerifyList;`);

    const request = {
      id: 'v1', user_id: 'u1', full_name: '<Applicant>', category: 'creator', reason: 'Reason <unsafe>',
      id_proof_url: 'https://example.test/id-proof', social_links: null, status: 'pending', admin_notes: null,
      created_at: '2026-03-04T00:00:00Z', profiles: { username: "applicant'", avatar_url: 'a', full_name: 'Profile Name', followers_count: 10 }
    };
    const list = resetElements();
    configureDb({ data: [request], error: null });
    const content = { innerHTML: '' };
    await global.adminTabVerify(content);
    assert(content.innerHTML.includes('vf-pending') && content.innerHTML.includes('vf-all'), 'verification tab renders all filter controls');
    assert(calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'pending'), 'pending status filter is applied');
    assert(list.innerHTML.includes('applicant'), 'embedded profile username renders');
    assert(list.innerHTML.includes('Reason &lt;unsafe&gt;'), 'verification reason is escaped');
    assert(list.innerHTML.includes('View ID Proof'), 'ID proof link renders when supplied');
    assert(list.innerHTML.includes('Approve') && list.innerHTML.includes('Reject'), 'pending verification actions render');
    assert(list.innerHTML.includes("adminApproveVerify('v1','u1'"), 'approve handler retains request and user ids');

    // Approved filter removes pending actions and applies selected styling.
    resetElements();
    configureDb({ data: [{ ...request, status: 'approved' }], error: null });
    global.setVerifyFilter('approved');
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(elements.get('vf-approved').style.color, '#3db83d', 'approved filter receives selected styling');
    assert(!elements.get('admin-verify-list').innerHTML.includes('Approve'), 'approved request has no approve action');
    assert(!elements.get('admin-verify-list').innerHTML.includes('Reject'), 'approved request has no reject action');

    // All filter omits status equality and preserves rejected status display.
    resetElements();
    configureDb({ data: [{ ...request, status: 'rejected', id_proof_url: null }], error: null });
    global.setVerifyFilter('all');
    await new Promise(resolve => setImmediate(resolve));
    assert(!calls.some(call => call[0] === 'eq' && call[1] === 'status'), 'all filter omits status equality');
    assert(elements.get('admin-verify-list').innerHTML.includes('rejected'), 'rejected status is rendered');
    assert(!elements.get('admin-verify-list').innerHTML.includes('View ID Proof'), 'missing proof does not render a proof link');

    // Empty and failure states remain stable.
    resetElements();
    configureDb({ data: [], error: null });
    await global.loadVerifyList();
    assert(elements.get('admin-verify-list').innerHTML.includes('No all verification requests'), 'empty state includes current filter');
    configureDb({ data: null, error: new Error('verification unavailable') });
    await global.loadVerifyList();
    assert(elements.get('admin-verify-list').innerHTML.includes('Failed: verification unavailable'), 'failure state renders safe message');

    console.log('ADMIN_VERIFICATION_TAB_HARNESS=PASS');
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
