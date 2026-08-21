const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'news.js'), 'utf8');

for (const marker of [
  'function showNews()',
  "modal('📰 News')",
  "m.querySelector('#mbody')",
  'Personalized News',
  "['For You','Tech','Gaming','Sports','Entertainment','Business','Science','Health']",
  "i===0?'#fff'",
  'Flutter 4.0 released with new features',
  'Valorant World Cup 2026 announced',
  'AI breakthrough in healthcare',
  'New SpaceX mission successful',
  'Bitcoin crosses $80k mark',
  'TechCrunch',
  'ESPN',
  'BBC',
  'Space.com',
  'CoinDesk',
  "toast('Opening article...')"
]) {
  assert(source.includes(marker), `News marker missing: ${marker}`);
}
assert.strictEqual((source.match(/title:'/g) || []).length, 5, 'News must retain five article fixtures');
assert.strictEqual((source.match(/source:'/g) || []).length, 5, 'News must retain five article sources');
assert.strictEqual((source.match(/time:'/g) || []).length, 5, 'News must retain five article timestamps');
assert.strictEqual((source.match(/toast\('Opening article\.\.\.'\)/g) || []).length, 1, 'News must use one article toast template');
assert(!source.includes('fetch('), 'News display must not own network requests');
assert(!source.includes('supabase'), 'News display must not own persistence');
assert(source.includes('showNewsFeed'), 'News must preserve the independent inline showNewsFeed boundary documentation');

console.log('NEWS_CONTRACT_HARNESS=PASS');
console.log('MODAL_CATEGORIES_DEFAULT_SELECTION_ARTICLES_METADATA_TOAST_INLINE_BOUNDARY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/news.js');
console.log('PRODUCTION_CHANGE=0');
