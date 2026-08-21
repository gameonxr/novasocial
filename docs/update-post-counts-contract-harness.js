const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'update-post-counts.js'), 'utf8');

for (const marker of [
  'function updatePostCounts(pid,likesCount,commentsCount)',
  "document.getElementById('lbtn-'+pid)",
  "el.dataset.cnt=likesCount",
  "document.getElementById('lcnt-'+pid)",
  "lc1.textContent=fmt(likesCount)+' likes'",
  "lc1.style.display=likesCount>0?'block':'none'",
  "document.getElementById('lcnt-'+pid+'-txt')",
  "document.getElementById('ccnt-'+pid)",
  "cc.textContent='View all '+commentsCount+' comments'",
  "cc.style.display=commentsCount>0?'block':'none'",
  "document.getElementById('ccnt-'+pid+'-txt')"
]) {
  assert(source.includes(marker), `Update post counts marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Update post counts must not own network requests');
assert(!source.includes('supabase'), 'Update post counts must not own persistence');
assert.strictEqual((source.match(/function updatePostCounts\(/g) || []).length, 1, 'Update post counts must have one module owner');

console.log('UPDATE_POST_COUNTS_CONTRACT_HARNESS=PASS');
console.log('LIKE_COMMENT_TARGET_GUARDS_FORMAT_VISIBILITY_ALTERNATE_TEXT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/update-post-counts.js');
console.log('PRODUCTION_CHANGE=0');
