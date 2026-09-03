'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDocument = global.document;
  const originalPROF = global.PROF;
  const originalModal = global.modal;
  const originalEsc = global.esc;
  const originalCloseModal = global.closeModal;

  const modals = [];
  global.document = {};
  global.PROF = { is_super_admin: false, is_admin: false };
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.closeModal = () => {};
  global.modal = title => {
    const body = { innerHTML: '' };
    const handle = { title, querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; }, body };
    modals.push(handle);
    return handle;
  };

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const start = source.indexOf('function showStaffActions(userId, username, currentRole, isSuper){');
    assert(start >= 0, 'showStaffActions declaration must remain present');
    const end = source.indexOf('\n// ─── Moderator promote/demote functions ───', start);
    assert(end > start, 'showStaffActions boundary must remain unique and ordered');
    const fnSource = source.slice(start, end);
    eval(`global.showStaffActions = ${fnSource.slice(fnSource.indexOf('function showStaffActions'), fnSource.length)}`);

    function lastBody() {
      assert(modals.length > 0, 'modal should be created');
      return modals[modals.length - 1].body.innerHTML;
    }

    // A super admin managing an administrator sees both demotion actions.
    global.PROF = { is_super_admin: true, is_admin: true };
    global.showStaffActions('admin-1', "A<'Admin", 'admin', 'super');
    let html = lastBody();
    assert(html.includes('Current role: ADMIN'), 'current role is normalized for display');
    assert(html.includes('A&lt;&#39;Admin'), 'username is HTML-escaped');
    assert(html.includes('Demote to Moderator'), 'super admin can demote an administrator to moderator');
    assert(html.includes('Remove Admin Completely'), 'super admin can remove administrator access');
    assert(html.includes("adminDemoteToModerator('admin-1'"), 'demotion handler retains user id');
    assert(html.includes('Cancel'), 'cancel action is always present');

    // An ordinary administrator cannot manage an administrator through this modal.
    global.PROF = { is_super_admin: false, is_admin: true };
    global.showStaffActions('admin-2', 'Admin Two', 'admin', '');
    html = lastBody();
    assert(!html.includes('Demote to Moderator'), 'ordinary admin cannot demote an administrator here');
    assert(!html.includes('Remove Admin Completely'), 'ordinary admin cannot remove administrator access here');
    assert.strictEqual((html.match(/<button /g) || []).length, 1, 'unsupported role action set is cancel-only');

    // A super admin managing a moderator sees promotion and removal actions.
    global.PROF = { is_super_admin: true, is_admin: true };
    global.showStaffActions('mod-1', 'Moderator One', 'moderator', '');
    html = lastBody();
    assert(html.includes('Promote to Admin'), 'super admin can promote a moderator to admin');
    assert(html.includes('Remove Moderator'), 'super admin can remove moderator access');
    assert(html.includes("adminPromoteModToAdmin('mod-1'"), 'promotion handler retains user id');

    // A non-super administrator can remove a moderator but cannot promote them to admin.
    global.PROF = { is_super_admin: false, is_admin: true };
    global.showStaffActions('mod-2', 'Moderator Two', 'moderator', '');
    html = lastBody();
    assert(!html.includes('Promote to Admin'), 'ordinary admin cannot promote moderator to admin');
    assert(html.includes('Remove Moderator'), 'ordinary admin can remove moderator access');
    assert.strictEqual((html.match(/<button /g) || []).length, 2, 'ordinary moderator management has one action plus cancel');

    // Non-staff roles render only the safe cancel action.
    global.PROF = { is_super_admin: true, is_admin: true };
    global.showStaffActions('user-1', 'Regular User', 'user', '');
    html = lastBody();
    assert(!html.includes('Demote'), 'regular user has no demotion action');
    assert(!html.includes('Promote'), 'regular user has no promotion action');
    assert.strictEqual((html.match(/<button /g) || []).length, 1, 'regular user action set is cancel-only');

    console.log('SHOW_STAFF_ACTIONS_HARNESS=PASS');
  } finally {
    global.document = originalDocument;
    global.PROF = originalPROF;
    global.modal = originalModal;
    global.esc = originalEsc;
    global.closeModal = originalCloseModal;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
