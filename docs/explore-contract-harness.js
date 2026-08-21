const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'explore.js'), 'utf8');

for (const marker of [
  'async function renderExplore()',
  'const myGeneration = _renderGeneration',
  "document.getElementById('screen')",
  "db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url)').eq('is_reel',false).order('likes_count',{ascending:false}).limit(30)",
  "db.from('posts').select('*').eq('is_reel',false).order('likes_count',{ascending:false}).limit(30)",
  "db.from('profiles').select('id,username,avatar_url').in('id', userIds)",
  'getBlockedBothWaysSet()',
  'if(myGeneration !== _renderGeneration) return;',
  "id=\"sq\" oninput=\"onSearchInput(this.value)\"",
  'showTrendingPage()',
  "['All','People','Photos','Videos','Travel','Food','Art','Tech']",
  'funny gaming videos',
  'music covers',
  'function exPill(el,c)',
  'function onSearchInput(q)',
  'searchDebounceT=setTimeout(()=>doSearch(q),350)',
  'function handleSmartSearch(q)',
  'const naturalLangPatterns =',
  'universalAISearch(q)',
  'doSearch(q)',
  'async function doSearch(q)',
  "db.from('profiles').select('*').ilike('username',`%${qq}%`).limit(15)",
  "db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url)').ilike('caption',`%${qq}%`).limit(20)",
  "showUserProfile('${u.id}')",
  "viewPost('${p.id}')",
  'ke liye koi result nahi mila'
]) {
  assert(source.includes(marker), `Explore marker missing: ${marker}`);
}
assert.strictEqual((source.match(/\.limit\(30\)/g) || []).length, 2, 'Explore must retain primary and fallback thirty-post caps');
assert.strictEqual((source.match(/\.limit\(15\)/g) || []).length, 1, 'Explore search must retain the fifteen-user cap');
assert.strictEqual((source.match(/\.limit\(20\)/g) || []).length, 1, 'Explore search must retain the twenty-post cap');
assert.strictEqual((source.match(/\['All','People','Photos','Videos','Travel','Food','Art','Tech'\]/g) || []).length, 1, 'Explore must retain eight category pills');
assert.strictEqual((source.match(/getBlockedBothWaysSet\(\)/g) || []).length, 2, 'Explore must guard both render and search result paths');
assert(!source.includes('sendMessage'), 'Explore must not own protected messaging');
assert(!source.includes('openChat'), 'Explore must not own protected chat navigation');

console.log('EXPLORE_CONTRACT_HARNESS=PASS');
console.log('GENERATION_FALLBACK_BLOCK_FILTER_SEARCH_UI_PILLS_DEBOUNCE_SMART_ROUTING_CAPS_RENDER_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/explore.js');
console.log('PRODUCTION_CHANGE=0');
