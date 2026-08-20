const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'new-posts-indicator.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function showNewPostsIndicator()',
  "document.getElementById('new-posts-pill')",
  "document.getElementById('screen')",
  "document.createElement('div')",
  "pill.id = 'new-posts-pill'",
  "pill.onclick = ()=>{ pill.remove(); invalidateTabCache('home'); go('home'); }",
  "pill.innerHTML = '↑ New posts'",
  'document.body.appendChild(pill)',
  'setTimeout(()=>{ if(pill && pill.parentNode) pill.remove(); }, 8000)'
]) {
  assert(source.includes(marker), `New posts indicator marker missing: ${marker}`);
}
assert(html.includes('src/features/new-posts-indicator.js'), 'New posts indicator module must remain linked from HTML');
assert(!source.includes('fetch('), 'New posts indicator must not own network requests');
assert(!source.includes('supabase'), 'New posts indicator must not own remote data access');
assert.strictEqual((source.match(/function showNewPostsIndicator\(/g) || []).length, 1, 'New posts indicator must have one module owner');

console.log('NEW_POSTS_INDICATOR_CONTRACT_HARNESS=PASS');
console.log('DUPLICATE_GUARD_SCREEN_PILL_TAP_CACHE_NAV_TIMED_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/new-posts-indicator.js');
console.log('PRODUCTION_CHANGE=0');
