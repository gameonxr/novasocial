const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'trending.js'), 'utf8');

for (const marker of [
  'async function _extractAndStoreHashtags(postId, caption)',
  'if (!postId || !caption) return;',
  'caption.match(/#[\\w]+/g) || []',
  'const uniqueTags = [...new Set(tags)]',
  "db.rpc('increment_hashtag_count', { tag_name: tag })",
  "db.from('post_hashtags').insert({",
  'post_id: postId,',
  'hashtag_id: hashtagId',
  'async function showTrendingPage()',
  "db.from('hashtags')",
  ".select('name, posts_count')",
  ".order('posts_count', {ascending: false})",
  '.limit(20)',
  'const defaultTrending = [',
  '#novasocial',
  '#aesthetic',
  'Top Trends Right Now',
  'Most used hashtags in last 500 posts',
  'class="trending-tag"',
  "searchHashtag('${t[0]}')",
  "searchHashtag('${t.tag}')",
  'i<3?\'🔥\':\'📈\'',
  'async function searchHashtag(tag)',
  "go('explore')",
  "document.getElementById('sq')",
  'doSearch(tag)',
  '}, 300);'
]) {
  assert(source.includes(marker), `Trending marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.rpc\(/g) || []).length, 1, 'Trending must own one atomic hashtag RPC');
assert.strictEqual((source.match(/db\.from\(/g) || []).length, 2, 'Trending must retain one link insert and one top-tag query');
assert.strictEqual((source.match(/\.limit\(20\)/g) || []).length, 1, 'Trending must retain the twenty-tag cap');
assert.strictEqual((source.match(/\{tag:/g) || []).length, 8, 'Trending must retain eight fallback trend fixtures');
assert.strictEqual((source.match(/searchHashtag\(/g) || []).length, 3, 'Trending must retain two card templates and one function definition');
assert(source.includes('new Set(tags)'), 'Trending must deduplicate tags before indexing');
assert(source.includes("if (!error && hashtagData && hashtagData.length)"), 'Trending must use database tags only when data is usable');
assert(!source.includes('renderDMs'), 'Trending must not own the protected DM renderer');
assert(!source.includes('renderReels'), 'Trending must not own the protected Reels renderer');

console.log('TRENDING_CONTRACT_HARNESS=PASS');
console.log('HASHTAG_EXTRACTION_DEDUP_RPC_LINK_QUERY_FALLBACK_RANKING_SEARCH_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/trending.js');
console.log('PRODUCTION_CHANGE=0');
