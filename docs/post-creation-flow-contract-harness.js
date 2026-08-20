const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const createModule = fs.readFileSync(path.join(repo, 'src', 'features', 'create.js'), 'utf8');

const requiredCreateMarkers = [
  'function showCreateMenu()',
  "showCreate('post')",
  "showCreate('reel')",
  "showCreate('story')",
  'showLiveStreamUI()',
  'function showCreate(type)',
  'prevMedia(this,\'${type}\')',
  'id="capinp"',
  'id="locinp"',
  'id="uprog"',
  'onclick="submitCreate(\'${type}\')"'
];
for (const marker of requiredCreateMarkers) {
  assert(createModule.includes(marker), `Create entry marker missing: ${marker}`);
}
const requiredSubmitMarkers = [
  'async function submitCreate(type)',
  'getElementById(\'fpick\')',
  'await upload(',
  'const _thumbnailUrl = _isVideoUpload ? _deriveVideoThumbnailUrl(url) : null',
  'media_type: _isVideoUpload ? \'video\' : \'image\'',
  'is_reel: type === \'reel\'',
  'caption: cap',
  'location: loc',
  'insertData.co_author_id = window._collabAuthor.id',
  'await db.from(\'posts\').insert(insertData).throwOnError()',
  'delete insertData.co_author_id',
  'RATE_LIMIT_EXCEEDED',
  'sendMentionNotifications(newPost.id)',
  '_extractAndStoreHashtags(newPost.id, cap)',
  "invalidateTabCache('home')",
  "invalidateTabCache('profile')",
  "invalidateTabCache('explore')",
  'destroyReelsPersistentContainer()',
  "go(type==='reel'?'reels':'home')",
  'Upload failed'
];
for (const marker of requiredSubmitMarkers) {
  assert(html.includes(marker), `Submit-create marker missing: ${marker}`);
}
assert(html.includes("await sendNotif(_collabAuthorRef.id, 'mention'"), 'Co-author notification boundary must remain');
assert(html.includes("db.from('follows').select('follower_id')"), 'Follower notification query must remain');
assert(html.includes('window._collabAuthor = null'), 'Create state reset must remain');
assert(html.includes("window._selectedFilter = 'none'"), 'Filter state reset must remain');
assert(html.includes('closeModal();'), 'Successful creation must close the modal');
assert(fs.existsSync(path.join(repo, 'docs', 'share-story-post-contract.md')), 'Story-share contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'notification-dispatch-contract.md')), 'Notification-dispatch contract must remain present');
assert.strictEqual((html.match(/async function submitCreate\(/g) || []).length, 1, 'submitCreate must have one inline owner');
assert.strictEqual((createModule.match(/function showCreate\(/g) || []).length, 1, 'showCreate must have one extracted owner');

console.log('POST_CREATION_FLOW_CONTRACT_HARNESS=PASS');
console.log('ENTRY_UPLOAD_INSERT_FALLBACK_NOTIFY_CACHE_NAVIGATION=LOCKED');
console.log('PRODUCTION_CHANGE=0');
