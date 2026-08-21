const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'news-feed.js'), 'utf8');

for (const marker of [
  'async function showNewsFeed()',
  "modal('📰 News Feed')",
  "m.querySelector('#mbody')",
  'class="spin"',
  'Date.now() - 24*60*60*1000',
  "db.from('posts')",
  "select('id,caption,media_url,media_type,user_id,created_at,likes_count,comments_count,views_count,profiles!posts_user_id_fkey(username,avatar_url,is_verified)')",
  ".gt('created_at', yesterday)",
  ".order('likes_count', { ascending: false })",
  '.limit(20)',
  'No trending news right now',
  'Trending Now',
  'Top posts from last 24 hours',
  "esc(p.caption || '[Media post]')",
  "esc(prof.username || 'unknown')",
  'p.likes_count||0',
  "closeModal();viewPost('${p.id}')",
  'Failed to load:'
]) {
  assert(source.includes(marker), `News feed marker missing: ${marker}`);
}
assert.strictEqual((source.match(/\.from\('posts'\)/g) || []).length, 1, 'News feed must own one posts query');
assert.strictEqual((source.match(/\.limit\(20\)/g) || []).length, 1, 'News feed must retain the twenty-result cap');
assert.strictEqual((source.match(/viewPost\('\$\{p\.id\}'\)/g) || []).length, 1, 'News feed must use one result navigation template');
assert.strictEqual((source.match(/esc\(/g) || []).length, 2, 'News feed must escape caption and username output');
assert(source.includes('if(error) throw error;'), 'News feed must preserve database error propagation to the error state');
assert(source.includes('if(!posts || posts.length === 0)'), 'News feed must preserve empty-result handling');
assert(!source.includes('renderReels'), 'News feed must not own the protected Reels renderer');
assert(!source.includes('renderDMs'), 'News feed must not own the protected DM renderer');

console.log('NEWS_FEED_CONTRACT_HARNESS=PASS');
console.log('LOADING_24H_QUERY_FIELDS_ORDER_CAP_EMPTY_ERROR_ESCAPED_RESULTS_VIEW_POST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/news-feed.js');
console.log('PRODUCTION_CHANGE=0');
