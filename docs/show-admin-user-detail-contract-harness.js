'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalME = global.ME;
  const originalModal = global.modal;
  const originalDb = global.db;
  const originalAv = global.av;
  const originalEsc = global.esc;
  const originalIco = global.ico;
  const originalLoadUserReportStats = global.loadUserReportStats;

  const modals = [];
  const dbCalls = [];
  const reportCalls = [];
  global.ME = { id: 'self-id' };
  global.av = (avatar, username, size) => `[av:${username}:${size}]`;
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.ico = (name, color, size) => `[ico:${name}:${color}:${size}]`;
  global.loadUserReportStats = async userId => { reportCalls.push(userId); };
  global.modal = title => {
    const body = { innerHTML: '' };
    const handle = { title, body, querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
    modals.push(handle);
    return handle;
  };

  function configureDb({ profile = null, profileError = null, postCount = 0 }) {
    dbCalls.length = 0;
    global.db = {
      from(table) {
        dbCalls.push(['from', table]);
        if (table === 'profiles') {
          const builder = {
            select(value) { dbCalls.push(['profiles.select', value]); return builder; },
            eq(column, value) { dbCalls.push(['profiles.eq', column, value]); return builder; },
            single() { return Promise.resolve({ data: profile, error: profileError }); }
          };
          return builder;
        }
        if (table === 'posts') {
          const builder = {
            select(value, options) { dbCalls.push(['posts.select', value, options]); return builder; },
            eq(column, value) { dbCalls.push(['posts.eq', column, value]); return Promise.resolve({ count: postCount }); }
          };
          return builder;
        }
        throw new Error(`unexpected table ${table}`);
      }
    };
  }

  try {
    const source = fs.readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function showAdminUserDetail(userId){');
    assert(start >= 0, 'showAdminUserDetail declaration must remain present');
    const end = source.indexOf('\n// Load real report stats for a user in admin detail view', start);
    assert(end > start, 'showAdminUserDetail boundary must remain unique and ordered');
    const fnSource = source.slice(start, end);
    eval(`global.showAdminUserDetail = ${fnSource.slice(fnSource.indexOf('async function showAdminUserDetail'), fnSource.length)}`);

    // A normal non-self user renders profile badges, counts, actions, and report placeholder.
    reportCalls.length = 0;
    configureDb({
      profile: {
        id: 'u1', username: "<target>'", full_name: '<Target>', avatar_url: 'avatar',
        is_admin: false, is_banned: true, is_msg_banned: false,
        ban_reason: 'policy <reason>', msg_ban_reason: null,
        followers_count: 42, created_at: '2026-01-02T00:00:00Z'
      },
      postCount: 7
    });
    await global.showAdminUserDetail('u1');
    let html = modals.at(-1).body.innerHTML;
    assert.deepStrictEqual(dbCalls, [
      ['from', 'profiles'], ['profiles.select', '*'], ['profiles.eq', 'id', 'u1'],
      ['from', 'posts'], ['posts.select', 'id', { count: 'exact', head: true }], ['posts.eq', 'user_id', 'u1']
    ], 'profile and post-count reads execute through the expected parallel query boundaries');
    assert(html.includes('target'), 'profile identity renders');
    assert(html.includes('ADMIN') === false, 'non-admin does not get admin badge');
    assert(html.includes('BANNED'), 'banned badge renders');
    assert(html.includes('Ban Reason'), 'ban reason section renders for banned users');
    assert(html.includes('policy &lt;reason&gt;'), 'ban reason is escaped');
    assert(html.includes('>7</div>'), 'post count renders');
    assert(html.includes('>42</div>'), 'follower count renders');
    assert(html.includes('Unban User'), 'banned user receives unban action');
    assert(html.includes('Ban Messages Only'), 'unrestricted messaging receives message-ban action');
    assert(html.includes('Promote to Admin'), 'non-admin receives promotion action');
    assert(html.includes('admin-user-reports'), 'report section placeholder renders');
    assert.deepStrictEqual(reportCalls, ['u1'], 'report stats load is delegated with the target id');

    // Self-view never exposes admin actions.
    reportCalls.length = 0;
    configureDb({
      profile: { id: 'self-id', username: 'Me', full_name: 'Self', is_admin: true, is_banned: false, is_msg_banned: true, msg_ban_reason: 'spam', followers_count: 1, created_at: null },
      postCount: 0
    });
    await global.showAdminUserDetail('self-id');
    html = modals.at(-1).body.innerHTML;
    assert(html.includes('Cannot perform actions on yourself'), 'self-view renders protected no-actions state');
    assert(!html.includes('Ban User'), 'self-view does not render ban action');
    assert(!html.includes('Remove Admin'), 'self-view does not render demotion action');
    assert.deepStrictEqual(reportCalls, ['self-id'], 'self-view still delegates report stats');

    // Missing profile renders the stable not-found state and does not delegate report loading.
    reportCalls.length = 0;
    configureDb({ profile: null, postCount: 0 });
    await global.showAdminUserDetail('missing');
    html = modals.at(-1).body.innerHTML;
    assert.strictEqual(html, '<div style="padding:30px;text-align:center;color:#FF2D7A">User not found</div>');
    assert.deepStrictEqual(reportCalls, [], 'not-found profile does not load report stats');

    // Profile query failures render a safe failure state.
    configureDb({ profile: null, profileError: new Error('profile read failed'), postCount: 0 });
    await global.showAdminUserDetail('error');
    html = modals.at(-1).body.innerHTML;
    assert(html.includes('Failed: profile read failed'), 'profile failure renders safe error text');

    console.log('SHOW_ADMIN_USER_DETAIL_HARNESS=PASS');
  } finally {
    global.ME = originalME;
    global.modal = originalModal;
    global.db = originalDb;
    global.av = originalAv;
    global.esc = originalEsc;
    global.ico = originalIco;
    global.loadUserReportStats = originalLoadUserReportStats;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
