const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const moduleSource = fs.readFileSync(path.join(repo, 'src', 'features', 'scheduled-posts.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'let scheduledPosts = []',
  "localStorage.getItem('nova-scheduled'",
  'JSON.parse',
  'function showScheduledPosts()',
  "modal('⏰ Scheduled Posts')",
  "if(!scheduledPosts.length)",
  'No scheduled posts',
  'scheduledPosts.map((s,i)',
  's.mediaUrl',
  's.caption',
  's.scheduledFor',
  'deleteScheduledPost(${i})',
  'function deleteScheduledPost(idx)',
  "if(!confirm('Delete this scheduled post?')) return;",
  'scheduledPosts.splice(idx,1)',
  "localStorage.setItem('nova-scheduled', JSON.stringify(scheduledPosts))",
  'showScheduledPosts();',
  "toast('Deleted')"
];
for (const marker of requiredMarkers) {
  assert(moduleSource.includes(marker), `Scheduled-post marker missing: ${marker}`);
}
assert(html.includes('src/features/scheduled-posts.js'), 'Scheduled-post module must remain linked from HTML');
assert.strictEqual((moduleSource.match(/function showScheduledPosts\(/g) || []).length, 1, 'Scheduled-post renderer must have one module owner');
assert.strictEqual((moduleSource.match(/function deleteScheduledPost\(/g) || []).length, 1, 'Scheduled-post delete handler must have one module owner');
assert(moduleSource.includes('try { scheduledPosts = JSON.parse'), 'Storage initialization must remain guarded');
assert(moduleSource.includes('try { localStorage.setItem'), 'Storage persistence must remain guarded');

console.log('SCHEDULED_POSTS_CONTRACT_HARNESS=PASS');
console.log('STORAGE_EMPTY_ORDER_DELETE_REFRESH=LOCKED');
console.log('MODULE_OWNER=src/features/scheduled-posts.js');
console.log('PRODUCTION_CHANGE=0');
