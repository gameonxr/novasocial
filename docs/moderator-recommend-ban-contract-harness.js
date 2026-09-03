'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDb = global.db;
  const originalME = global.ME;
  const originalPROF = global.PROF;
  const originalToast = global.toast;
  const originalLogAdminAction = global.logAdminAction;
  const originalCloseModal = global.closeModal;

  const calls = [];
  const toasts = [];
  const audits = [];
  let closeCount = 0;
  let insertResult = { error: null };
  global.ME = { id: 'moderator-1' };
  global.PROF = { is_moderator: true, is_admin: false, is_super_admin: false };
  global.toast = message => toasts.push(message);
  global.logAdminAction = async (...args) => audits.push(args);
  global.closeModal = () => { closeCount += 1; };

  function configureDb(result) {
    calls.length = 0;
    toasts.length = 0;
    audits.length = 0;
    closeCount = 0;
    insertResult = result;
    global.db = { from(table) {
      calls.push(['from', table]);
      return {
        insert(payload) {
          calls.push(['insert', payload]);
          return Promise.resolve(insertResult);
        }
      };
    } };
  }

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function moderatorRecommendBan(');
    const end = source.indexOf('\n// Admin tab: Approvals', start);
    assert(start >= 0 && end > start, 'moderator recommendation boundary must remain present and ordered');
    const fnSource = source.slice(start, end);
    eval(`global.moderatorRecommendBan = ${fnSource.slice(fnSource.indexOf('async function moderatorRecommendBan'), fnSource.length)}`);

    // Authorized moderator submits a trimmed recommendation.
    configureDb({ error: null });
    await global.moderatorRecommendBan('target-1', 'Target', '  reason <unsafe>  ', 'report-1');
    assert.deepStrictEqual(calls, [
      ['from', 'ban_approvals'],
      ['insert', { moderator_id: 'moderator-1', target_user_id: 'target-1', reason: 'reason <unsafe>', target_type: 'user', target_id: 'report-1', status: 'pending' }]
    ], 'recommendation inserts the expected trimmed pending payload');
    assert.deepStrictEqual(audits, [['recommend_ban', 'target-1', 'user', 'Recommended ban for "Target": reason <unsafe>']], 'recommendation is audited');
    assert(toasts.includes('✅ Ban recommendation sent to admins for approval'), 'success toast renders');
    assert.strictEqual(closeCount, 1, 'modal closes after success');

    // Missing reason is rejected before database access.
    configureDb({ error: null });
    await global.moderatorRecommendBan('target-2', 'Target 2', '  ', null);
    assert.deepStrictEqual(calls, [], 'blank reason does not reach the database');
    assert(toasts.includes('Please provide a reason'), 'blank reason receives validation toast');
    assert.strictEqual(closeCount, 0, 'blank reason does not close the modal');

    // Non-staff caller is rejected before database access.
    global.PROF = { is_moderator: false, is_admin: false, is_super_admin: false };
    configureDb({ error: null });
    await global.moderatorRecommendBan('target-3', 'Target 3', 'valid reason', null);
    assert.deepStrictEqual(calls, [], 'non-staff caller cannot insert recommendation');
    assert(toasts.includes('❌ Only staff can recommend bans'), 'non-staff receives authorization toast');

    // Insert failure is caught and surfaced without audit or close.
    global.PROF = { is_moderator: true, is_admin: false, is_super_admin: false };
    configureDb({ error: new Error('insert unavailable') });
    await global.moderatorRecommendBan('target-4', 'Target 4', 'valid reason', null);
    assert(toasts.some(message => message.includes('❌ Failed: insert unavailable')), 'insert failure receives failure toast');
    assert.deepStrictEqual(audits, [], 'failed insert is not audited');
    assert.strictEqual(closeCount, 0, 'failed insert does not close the modal');

    console.log('MODERATOR_RECOMMEND_BAN_HARNESS=PASS');
  } finally {
    global.db = originalDb;
    global.ME = originalME;
    global.PROF = originalPROF;
    global.toast = originalToast;
    global.logAdminAction = originalLogAdminAction;
    global.closeModal = originalCloseModal;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
