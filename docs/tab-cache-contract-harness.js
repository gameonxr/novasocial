'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDocument = global.document;
  const originalWindow = global.window;
  const originalDateNow = Date.now;
  const originalRaf = global.requestAnimationFrame;

  const elements = new Map();
  const rafQueue = [];
  global.window = { _chatScreenActive: false };
  global.requestAnimationFrame = callback => { rafQueue.push(callback); return rafQueue.length; };
  global.document = { getElementById: id => elements.get(id) || null };

  const screen = {
    innerHTML: '<fresh>',
    scrollTop: 0,
    style: {},
    appendChild() {}
  };
  elements.set('screen', screen);

  async function flushRaf() {
    assert.strictEqual(rafQueue.length, 1, 'first restore frame is queued');
    const first = rafQueue.shift();
    first();
    assert.strictEqual(rafQueue.length, 1, 'second restore frame is queued');
    const second = rafQueue.shift();
    second();
  }

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const start = source.indexOf('const _tabCache = {};');
    const end = source.indexOf('\nlet svData=', start);
    assert(start >= 0 && end > start, 'tab-cache boundary must remain present and ordered');
    const block = source.slice(start, end);
    const hasInlineInvalidator = /function invalidateTabCache\(tab\)\s*\{/.test(block);
    const externalInvalidator = hasInlineInvalidator ? '' : fs.readFileSync('/home/z/my-project/novasocial/src/features/invalidate-tab-cache-owner.js', 'utf8');
    const invalidatorBinding = hasInlineInvalidator ? 'invalidateTabCache' : 'window.invalidateTabCache';
    const hasInlineAllInvalidator = /function invalidateAllTabCache\(\)\s*\{/.test(block);
    const externalAllInvalidator = hasInlineAllInvalidator ? '' : fs.readFileSync('/home/z/my-project/novasocial/src/features/invalidate-all-tab-cache.js', 'utf8');
    const allInvalidatorBinding = hasInlineAllInvalidator ? 'invalidateAllTabCache' : 'window.invalidateAllTabCache';
    const hasInlineSaveRestore = /function _saveTabToCache\(tab\)\s*\{/.test(block);
    const externalSaveRestore = hasInlineSaveRestore ? '' : fs.readFileSync('/home/z/my-project/novasocial/src/features/save-tab-to-cache.js', 'utf8');
    const saveRestoreBinding = hasInlineSaveRestore ? '_saveTabToCache' : 'window._saveTabToCache';
    const hasInlineTryRestore = /function _tryRestoreFromCache\(tab\)\s*\{/.test(block);
    const externalTryRestore = hasInlineTryRestore ? '' : fs.readFileSync('/home/z/my-project/novasocial/src/features/try-restore-from-cache.js', 'utf8');
    const tryRestoreBinding = hasInlineTryRestore ? '_tryRestoreFromCache' : 'window._tryRestoreFromCache';
    eval(`${block}; ${externalInvalidator}; ${externalAllInvalidator}; ${externalSaveRestore}; ${externalTryRestore}; global._saveTabToCache = ${saveRestoreBinding}; global._tryRestoreFromCache = ${tryRestoreBinding}; global.invalidateTabCache = ${invalidatorBinding}; global.invalidateAllTabCache = ${allInvalidatorBinding};`);

    // Enabled non-Reels tabs save HTML and scroll position.
    Date.now = () => 100000;
    screen.innerHTML = '<home-snapshot>';
    screen.scrollTop = 135;
    global._saveTabToCache('home');
    screen.innerHTML = '<changed>';
    screen.scrollTop = 0;
    assert.strictEqual(global._tryRestoreFromCache('home'), true, 'fresh home cache restores');
    assert.strictEqual(screen.innerHTML, '<home-snapshot>', 'cached HTML restores instantly');
    assert.strictEqual(screen.style.overflow, 'auto', 'restored normal tab uses auto overflow');
    assert.strictEqual(screen.style.display, 'block', 'restored tab is displayed');
    await flushRaf();
    assert.strictEqual(screen.scrollTop, 135, 'scroll position restores after double-rAF');

    // Expired cache requires a fresh load.
    Date.now = () => 100000 + 60001;
    assert.strictEqual(global._tryRestoreFromCache('home'), false, 'expired home cache is rejected');

    // Disabled/unknown tabs retain no HTML snapshot.
    Date.now = () => 200000;
    screen.innerHTML = '<unknown>';
    screen.scrollTop = 42;
    global._saveTabToCache('unknown');
    assert.strictEqual(global._tryRestoreFromCache('unknown'), false, 'unknown tab has no cache policy');

    // DMs chat mode preserves the last valid DMs snapshot while still saving scroll position.
    global.window._chatScreenActive = true;
    screen.innerHTML = '<chat-dom>';
    screen.scrollTop = 77;
    global._saveTabToCache('dms');
    global.window._chatScreenActive = false;
    screen.innerHTML = '<new-dms>'; screen.scrollTop = 0;
    assert.strictEqual(global._tryRestoreFromCache('dms'), false, 'chat DOM is not snapshotted as DMs cache');

    // Reels never receives an HTML snapshot.
    Date.now = () => 300000;
    screen.innerHTML = '<reels-dom>';
    screen.scrollTop = 19;
    global._saveTabToCache('reels');
    screen.innerHTML = '<after-reels>'; screen.scrollTop = 0;
    assert.strictEqual(global._tryRestoreFromCache('reels'), false, 'Reels uses persistent-container restore instead of HTML cache');

    // Targeted and global invalidation force fresh loads for cached tabs.
    Date.now = () => 400000;
    screen.innerHTML = '<explore>'; screen.scrollTop = 11;
    global._saveTabToCache('explore');
    assert.strictEqual(global._tryRestoreFromCache('explore'), true, 'explore cache exists before invalidation');
    global.invalidateTabCache('explore');
    assert.strictEqual(global._tryRestoreFromCache('explore'), false, 'targeted invalidation removes one cache');
    screen.innerHTML = '<profile>'; screen.scrollTop = 12;
    global._saveTabToCache('profile');
    screen.innerHTML = '<home>'; screen.scrollTop = 13;
    global._saveTabToCache('home');
    global.invalidateAllTabCache();
    assert.strictEqual(global._tryRestoreFromCache('profile'), false, 'global invalidation removes profile cache');
    assert.strictEqual(global._tryRestoreFromCache('home'), false, 'global invalidation removes home cache');

    console.log('TAB_CACHE_HARNESS=PASS');
  } finally {
    Date.now = originalDateNow;
    global.document = originalDocument;
    global.window = originalWindow;
    global.requestAnimationFrame = originalRaf;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
