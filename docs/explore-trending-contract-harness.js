const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const explore = fs.readFileSync(path.join(repo, 'src', 'features', 'explore.js'), 'utf8');
const trending = fs.readFileSync(path.join(repo, 'src', 'features', 'trending.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const exploreMarkers = [
  'async function renderExplore()',
  'const myGeneration = _renderGeneration',
  "eq('is_reel',false).order('likes_count',{ascending:false}).limit(30)",
  'Fallback without join',
  "from('profiles').select('id,username,avatar_url').in('id', userIds)",
  'const blockedIds = await getBlockedBothWaysSet()',
  'posts = (posts || []).filter(p => !blockedIds.has(p.user_id))',
  'if(myGeneration !== _renderGeneration) return;',
  'function onSearchInput(q)',
  'clearTimeout(searchDebounceT)',
  'searchDebounceT=setTimeout(()=>doSearch(q),350)',
  'function handleSmartSearch(q)',
  'universalAISearch(q)',
  'function doSearch(q)',
  "ilike('username',`%${qq}%`).limit(15)",
  "ilike('caption',`%${qq}%`).limit(20)",
  'filteredUsers = filteredUsers.filter(u => !blockedIds.has(u.id))',
  'filteredPosts = filteredPosts.filter(p => !blockedIds.has(p.user_id))'
];
for (const marker of exploreMarkers) {
  assert(explore.includes(marker), `Explore marker missing: ${marker}`);
}
const trendingMarkers = [
  'async function showTrendingPage()',
  "from('hashtags')",
  "select('name, posts_count')",
  "order('posts_count', {ascending: false})",
  '.limit(20)',
  'defaultTrending',
  'function searchHashtag(tag)',
  "go('explore')",
  'doSearch(tag)'
];
for (const marker of trendingMarkers) {
  assert(trending.includes(marker), `Trending marker missing: ${marker}`);
}
assert(html.includes('src/features/explore.js'), 'Explore module must remain linked from HTML');
assert(html.includes('src/features/trending.js'), 'Trending module must remain linked from HTML');
assert.strictEqual((explore.match(/function renderExplore\(/g) || []).length, 1, 'Explore renderer must have one module owner');
assert.strictEqual((trending.match(/function showTrendingPage\(/g) || []).length, 1, 'Trending renderer must have one module owner');

console.log('EXPLORE_TRENDING_CONTRACT_HARNESS=PASS');
console.log('QUERY_FALLBACK_BLOCK_FILTER_RACE_SMART_SEARCH_RANKING=LOCKED');
console.log('PRODUCTION_CHANGE=0');
