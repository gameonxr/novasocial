'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDb = global.db;
  const originalME = global.ME;
  const originalEsc = global.esc;
  const originalAgo = global.ago;
  const originalToast = global.toast;
  const originalLogAdminAction = global.logAdminAction;
  const originalDeleteMedia = global.deleteMultipleMediaProduction;
  const originalSendNotification = global.sendAdminNotification;
  const originalLoadDeleted = global.loadAdminDeletedPosts;
  const originalDocument = global.document;
  const originalWindow = global.window;

  const calls = [];
  const toasts = [];
  const auditCalls = [];
  const mediaCalls = [];
  const notificationCalls = [];
  let state = {};
  global.ME = { id: 'admin-1' };
  global.window = {};
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.ago = () => '2 days';
  global.toast = message => toasts.push(message);
  global.logAdminAction = async (...args) => { auditCalls.push(args); };
  global.deleteMultipleMediaProduction = async (...args) => { mediaCalls.push(args); };
  global.sendAdminNotification = async (...args) => { notificationCalls.push(args); };
  global.loadAdminDeletedPosts = async () => { calls.push(['loadAdminDeletedPosts.refresh']); };
  global.document = { getElementById: id => state.elements?.[id] || null };

  function configureDb(nextState) {
    calls.length = 0;
    auditCalls.length = 0;
    mediaCalls.length = 0;
    notificationCalls.length = 0;
    toasts.length = 0;
    state = { ...nextState, elements: nextState.elements || {} };
    global.db = { from(table) {
      calls.push(['from', table]);
      let op = null;
      let payload = null;
      const builder = {
        update(values) { op = 'update'; payload = values; calls.push([table, 'update', values]); return builder; },
        delete() { op = 'delete'; calls.push([table, 'delete']); return builder; },
        select(...args) { op = 'select'; calls.push([table, 'select', ...args]); return builder; },
        eq(...args) { calls.push([table, 'eq', ...args]); return builder; },
        order(...args) { calls.push([table, 'order', ...args]); return builder; },
        limit(...args) { calls.push([table, 'limit', ...args]); return builder; },
        maybeSingle() {
          return Promise.resolve(state.postFetch || { data: null, error: null });
        },
        then(resolve, reject) {
          let result = { data: [], error: null };
          if (table === 'posts' && op === 'update') {
            result = { data: null, error: state.softUpdateError || state.recoverUpdateError || null };
          } else if (table === 'posts' && op === 'delete') {
            result = { data: null, error: state.hardDeleteError || null };
          } else if (table === 'posts' && op === 'select') {
            result = state.deletedListResult || { data: [], error: null };
          }
          return Promise.resolve(result).then(resolve, reject);
        },
        catch(reject) { return Promise.resolve({ data: [], error: null }).catch(reject); }
      };
      return builder;
    } };
  }

  try {
    const softDeleteModule = fs.readFileSync('/home/z/my-project/novasocial/src/features/admin-soft-delete-post.js', 'utf8');
    const sdStart = softDeleteModule.indexOf('window.adminSoftDeletePost = async function adminSoftDeletePost(');
    assert(sdStart >= 0, 'soft-delete module owner must remain present');
    const softDeleteBlock = softDeleteModule.slice(sdStart + 'window.adminSoftDeletePost = '.length);
    const source = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function adminHardDeletePost(');
    const end = source.indexOf('\n/**\n * AUTO-PURGE', start);
    assert(start >= 0 && end > start, 'two-tier delete boundary must remain present and ordered');
    const fnSource = softDeleteBlock + '\n' + source.slice(start, end);
    eval(`${fnSource}; global.adminSoftDeletePost = adminSoftDeletePost; global.adminHardDeletePost = adminHardDeletePost; global.adminRecoverPost = adminRecoverPost; global.loadAdminDeletedPosts = loadAdminDeletedPosts;`);

    // Soft delete stores recoverable metadata and does not call media deletion.
    configureDb({});
    let result = await global.adminSoftDeletePost('post-1', 'Guideline violation');
    assert.strictEqual(result, true, 'soft delete returns true on success');
    const softUpdate = calls.find(call => call[0] === 'posts' && call[1] === 'update');
    assert(softUpdate, 'soft delete updates the post row');
    assert.deepStrictEqual({
      is_deleted: softUpdate[2].is_deleted,
      deleted_by: softUpdate[2].deleted_by,
      deletion_type: softUpdate[2].deletion_type,
      deletion_reason: softUpdate[2].deletion_reason
    }, { is_deleted: true, deleted_by: 'admin-1', deletion_type: 'admin_soft', deletion_reason: 'Guideline violation' });
    assert(Date.parse(softUpdate[2].auto_purge_at) > Date.now() + 29 * 24 * 60 * 60 * 1000, 'soft delete schedules purge about 30 days ahead');
    assert.strictEqual(mediaCalls.length, 0, 'soft delete does not delete media');
    assert(auditCalls.some(call => call[0] === 'soft_delete_post'), 'soft delete is audited');
    assert(toasts.some(message => message.includes('recoverable for 30 days')), 'soft delete success toast is shown');

    // Soft-delete failures return false and show a failure toast.
    configureDb({ softUpdateError: new Error('soft update failed') });
    result = await global.adminSoftDeletePost('post-2');
    assert.strictEqual(result, false, 'soft delete returns false on failure');
    assert(toasts.some(message => message.includes('Action failed: soft update failed')), 'soft delete failure toast is shown');

    // Hard delete fetches media, attempts related cleanup, deletes the row, then deletes media and audits/notifies.
    configureDb({ postFetch: { data: { media_url: 'https://media/post.mp4', thumbnail_url: 'https://media/thumb.jpg', media_type: 'video' }, error: null } });
    result = await global.adminHardDeletePost('post-3', 'owner-3', 'Permanent violation');
    assert.strictEqual(result, true, 'hard delete returns true on success');
    assert(calls.some(call => call[0] === 'posts' && call[1] === 'select'), 'hard delete fetches media before row deletion');
    for (const table of ['likes', 'comments', 'bookmarks', 'post_views', 'notifications']) assert(calls.some(call => call[0] === table && call[1] === 'delete'), `${table} cleanup is attempted`);
    assert(calls.some(call => call[0] === 'posts' && call[1] === 'delete'), 'post row deletion is attempted');
    assert.deepStrictEqual(mediaCalls, [[['https://media/post.mp4', 'https://media/thumb.jpg'], 'reel', 'admin_hard_delete']], 'video media is deleted as reel media after row deletion');
    assert(auditCalls.some(call => call[0] === 'hard_delete_post'), 'hard delete is audited');
    assert.deepStrictEqual(notificationCalls, [['owner-3', '🗑️ Aapka post permanently delete kar diya gaya hai. Reason: Permanent violation']], 'owner is notified after hard delete');

    // Hard-delete row failure returns false and does not invoke media cleanup.
    configureDb({ postFetch: { data: { media_url: 'https://media/post.jpg', thumbnail_url: null, media_type: 'image' }, error: null }, hardDeleteError: new Error('row delete failed') });
    result = await global.adminHardDeletePost('post-4', null);
    assert.strictEqual(result, false, 'hard delete returns false on row-delete failure');
    assert.strictEqual(mediaCalls.length, 0, 'media cleanup is not reached after row-delete failure');
    assert(toasts.some(message => message.includes('Delete failed: row delete failed')), 'hard-delete failure toast is shown');

    // Recovery clears all soft-delete fields, audits, refreshes the deleted list, and returns true.
    configureDb({});
    result = await global.adminRecoverPost('post-5');
    assert.strictEqual(result, true, 'recovery returns true on success');
    const recoverUpdate = calls.find(call => call[0] === 'posts' && call[1] === 'update');
    assert.deepStrictEqual(recoverUpdate[2], { is_deleted: false, deleted_at: null, deleted_by: null, deletion_type: null, deletion_reason: null, auto_purge_at: null }, 'recovery clears all soft-delete fields');
    assert(auditCalls.some(call => call[0] === 'recover_post'), 'recovery is audited');
    assert(fnSource.includes("if(typeof loadAdminDeletedPosts === 'function') loadAdminDeletedPosts();"), 'recovery retains guarded deleted-post list refresh delegation');

    // Deleted-post list renders recoverable records and stable empty/error states.
    const content = { innerHTML: '' };
    configureDb({ elements: { 'admin-content': content }, deletedListResult: { data: [{ id: 'post-6', media_url: null, media_type: 'image', caption: 'Deleted <caption>', deleted_at: '2026-03-01T00:00:00Z', auto_purge_at: new Date(Date.now() + 10 * 86400000).toISOString(), deleted_by: 'admin-1', profiles: { username: 'owner' } }], error: null } });
    await global.loadAdminDeletedPosts();
    assert(content.innerHTML.includes('DELETED POSTS (Recoverable — 30 days)'), 'deleted-post heading renders');
    assert(content.innerHTML.includes('@owner'), 'deleted post owner renders');
    assert(content.innerHTML.includes('Deleted &lt;caption&gt;'), 'deleted caption is escaped');
    assert(content.innerHTML.includes('Recover'), 'recover action renders');
    assert(content.innerHTML.includes("adminRecoverPost('post-6'"), 'recover handler retains post id');

    configureDb({ elements: { 'admin-content': content }, deletedListResult: { data: [], error: null } });
    await global.loadAdminDeletedPosts();
    assert(content.innerHTML.includes('Koi deleted post nahi hai'), 'empty deleted-post state renders');
    configureDb({ elements: { 'admin-content': content }, deletedListResult: { data: null, error: new Error('deleted list failed') } });
    await global.loadAdminDeletedPosts();
    assert(content.innerHTML.includes('Error: deleted list failed'), 'deleted-list failure renders escaped error');

    console.log('ADMIN_POST_DELETE_TWO_TIER_HARNESS=PASS');
  } finally {
    global.db = originalDb;
    global.ME = originalME;
    global.esc = originalEsc;
    global.ago = originalAgo;
    global.toast = originalToast;
    global.logAdminAction = originalLogAdminAction;
    global.deleteMultipleMediaProduction = originalDeleteMedia;
    global.sendAdminNotification = originalSendNotification;
    global.loadAdminDeletedPosts = originalLoadDeleted;
    global.document = originalDocument;
    global.window = originalWindow;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
