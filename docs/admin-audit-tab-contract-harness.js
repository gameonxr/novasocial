'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDb = global.db;
  const originalEsc = global.esc;
  const originalAv = global.av;

  const calls = [];
  let results = {};
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.av = (avatar, username, size) => `[av:${username}:${size}]`;

  function configureDb(nextResults) {
    calls.length = 0;
    results = nextResults;
    global.db = { from(table) {
      calls.push(['from', table]);
      const result = results[table] || { data: [], error: null };
      const builder = {
        select(...args) { calls.push([table, 'select', ...args]); return builder; },
        order(...args) { calls.push([table, 'order', ...args]); return builder; },
        limit(...args) { calls.push([table, 'limit', ...args]); return builder; },
        then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
        catch(reject) { return Promise.resolve(result).catch(reject); }
      };
      return builder;
    } };
  }

  try {
    const source = fs.readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function adminTabAudit(content){');
    const end = source.indexOf('\n// ─── Content Tab — browse all posts, delete any ───', start);
    assert(start >= 0 && end > start, 'audit-tab boundary must remain present and ordered');
    const fnSource = source.slice(start, end);
    eval(`global.adminTabAudit = ${fnSource.slice(fnSource.indexOf('async function adminTabAudit'), fnSource.length)}`);

    // audit_logs is the source of truth when it returns entries.
    const auditContent = { innerHTML: '' };
    configureDb({
      audit_logs: { data: [{
        id: 'log-1', actor_id: 'admin-1', actor_role: 'admin', target_type: 'user', target_id: 'target-123456789',
        action_type: 'ban_user', reason: 'Reason <unsafe>', ip_address: '10.0.0.1', user_agent: 'UA', status: 'denied',
        created_at: '2026-03-06T00:00:00Z', profiles: { username: "moderator'", avatar_url: 'a' }
      }], error: null },
      admin_actions: { data: [{ id: 'unused' }], error: null }
    });
    await global.adminTabAudit(auditContent);
    assert(calls[0][0] === 'from' && calls[0][1] === 'audit_logs', 'audit_logs is queried first');
    assert(!calls.some(call => call[0] === 'from' && call[1] === 'admin_actions'), 'fallback is not queried when audit logs have entries');
    assert(auditContent.innerHTML.includes('Showing 1 entries from audit_logs'), 'source label renders');
    assert(auditContent.innerHTML.includes('Banned user'), 'known action type receives human label');
    assert(auditContent.innerHTML.includes('denied'), 'non-success status badge renders');
    assert(auditContent.innerHTML.includes('admin'), 'non-user actor role badge renders');
    assert(auditContent.innerHTML.includes('Target: user · target-'), 'target type and truncated target id render');
    assert(auditContent.innerHTML.includes('Reason &lt;unsafe&gt;'), 'notes are escaped');
    assert(auditContent.innerHTML.includes('10.0.0.1'), 'IP address renders');
    assert(auditContent.innerHTML.includes('#ff4444'), 'denied ban action uses red category color');

    // Empty/error audit logs fall back to admin_actions.
    const fallbackContent = { innerHTML: '' };
    configureDb({
      audit_logs: { data: null, error: new Error('RLS denied') },
      admin_actions: { data: [{
        id: 'legacy-1', admin_id: 'admin-2', action_type: 'update_feature_flag', target_id: null,
        target_type: null, notes: 'Feature <updated>', created_at: '2026-03-07T00:00:00Z', ip_address: null,
        user_agent: null, profiles: { username: 'super', avatar_url: null }
      }], error: null }
    });
    await global.adminTabAudit(fallbackContent);
    assert(calls.some(call => call[0] === 'from' && call[1] === 'admin_actions'), 'admin_actions fallback is queried after audit failure');
    assert(fallbackContent.innerHTML.includes('Showing 1 entries from admin_actions'), 'fallback source label renders');
    assert(fallbackContent.innerHTML.includes('Updated feature flag'), 'fallback action label renders');
    assert(fallbackContent.innerHTML.includes('Feature &lt;updated&gt;'), 'fallback notes are escaped');
    assert(fallbackContent.innerHTML.includes('#ff8800'), 'feature flag action uses orange category color');

    // No entries from either source render the stable empty state.
    const emptyContent = { innerHTML: '' };
    configureDb({
      audit_logs: { data: [], error: null },
      admin_actions: { data: [], error: null }
    });
    await global.adminTabAudit(emptyContent);
    assert(emptyContent.innerHTML.includes('No audit entries found'), 'empty audit state renders');

    console.log('ADMIN_AUDIT_TAB_HARNESS=PASS');
  } finally {
    global.db = originalDb;
    global.esc = originalEsc;
    global.av = originalAv;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
