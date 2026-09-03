'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDocument = global.document;
  const originalDb = global.db;
  const originalME = global.ME;
  const originalPROF = global.PROF;
  const originalEsc = global.esc;
  const originalAv = global.av;

  const elements = new Map();
  const calls = [];
  let result = { data: [], error: null };
  global.document = { getElementById: id => elements.get(id) || null };
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.av = (avatar, username, size) => `[av:${username}:${size}]`;
  global.ME = { id: 'self' };
  global.PROF = { is_super_admin: true, is_admin: true };

  function configureDb(nextResult) {
    calls.length = 0;
    result = nextResult;
    global.db = { from(table) {
      calls.push(['from', table]);
      const builder = {
        select(...args) { calls.push(['select', ...args]); return builder; },
        or(...args) { calls.push(['or', ...args]); return builder; },
        order(...args) { calls.push(['order', ...args]); return builder; },
        then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
        catch(reject) { return Promise.resolve(result).catch(reject); }
      };
      return builder;
    } };
  }

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function loadTeamList(){');
    const end = source.indexOf('\nlet _teamSearchTimer = null;', start);
    assert(start >= 0 && end > start, 'loadTeamList boundary must remain present and ordered');
    const fnSource = source.slice(start, end);
    eval(`global.loadTeamList = ${fnSource.slice(fnSource.indexOf('async function loadTeamList'), fnSource.length)}`);

    const list = { innerHTML: '' };
    elements.set('admin-team-list', list);
    const staff = [
      { id: 'self', username: 'root', avatar_url: null, full_name: 'Root', is_admin: true, is_super_admin: true, is_moderator: false, is_banned: false, created_at: '2026-01-01', last_seen: null },
      { id: 'admin-1', username: "admin'", avatar_url: null, full_name: 'Admin', is_admin: true, is_super_admin: false, is_moderator: false, is_banned: false, created_at: '2026-01-02', last_seen: '2026-03-01' },
      { id: 'mod-1', username: 'mod', avatar_url: null, full_name: 'Moderator', is_admin: false, is_super_admin: false, is_moderator: true, is_banned: true, created_at: '2026-01-03', last_seen: null }
    ];
    configureDb({ data: staff, error: null });
    await global.loadTeamList();
    assert.deepStrictEqual(calls.slice(0, 5), [
      ['from', 'profiles'],
      ['select', 'id,username,avatar_url,full_name,is_admin,is_super_admin,is_moderator,is_banned,created_at,last_seen'],
      ['or', 'is_admin.eq.true,is_moderator.eq.true'],
      ['order', 'is_super_admin', { ascending: false }],
      ['order', 'is_admin', { ascending: false }]
    ], 'team query selects staff and preserves role ordering');
    assert(list.innerHTML.includes('SUPER ADMIN'), 'super-admin badge renders');
    assert(list.innerHTML.includes('ADMIN'), 'admin badge renders');
    assert(list.innerHTML.includes('MODERATOR'), 'moderator badge renders');
    assert(list.innerHTML.includes('(You)'), 'current user marker renders');
    assert(list.innerHTML.includes('BANNED'), 'banned marker renders');
    assert(!list.innerHTML.includes("showStaffActions('self'"), 'self does not receive Manage action');
    assert(list.innerHTML.includes("showStaffActions('admin-1'"), 'super admin can manage another admin');
    assert(list.innerHTML.includes("showStaffActions('mod-1'"), 'super admin can manage a moderator');
    assert(list.innerHTML.includes('Never active'), 'missing last-seen renders fallback');

    // Ordinary admin can manage moderators only.
    global.PROF = { is_super_admin: false, is_admin: true };
    await global.loadTeamList();
    assert(!list.innerHTML.includes("showStaffActions('admin-1'"), 'ordinary admin cannot manage another admin');
    assert(list.innerHTML.includes("showStaffActions('mod-1'"), 'ordinary admin can manage moderator');

    // Non-admin caller sees no Manage actions.
    global.PROF = { is_super_admin: false, is_admin: false };
    await global.loadTeamList();
    assert(!list.innerHTML.includes('showStaffActions('), 'non-admin caller sees no Manage actions');

    // Empty and failure states remain stable.
    configureDb({ data: [], error: null });
    await global.loadTeamList();
    assert.strictEqual(list.innerHTML, '<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No staff members</div>');
    configureDb({ data: null, error: new Error('team unavailable') });
    await global.loadTeamList();
    assert(list.innerHTML.includes('Failed: team unavailable'), 'team query failure renders safe message');

    console.log('ADMIN_TEAM_LIST_HARNESS=PASS');
  } finally {
    global.document = originalDocument;
    global.db = originalDb;
    global.ME = originalME;
    global.PROF = originalPROF;
    global.esc = originalEsc;
    global.av = originalAv;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
