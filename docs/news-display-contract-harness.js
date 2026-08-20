const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'news.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function showNews()',
  "modal('📰 News')",
  'Personalized News',
  "['For You','Tech','Gaming','Sports','Entertainment','Business','Science','Health']",
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
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `News marker missing: ${marker}`);
}
assert(html.includes('src/features/news.js'), 'News module must remain linked from HTML');
assert(!source.includes('db.from('), 'Extracted News display must not own database reads');
assert(!source.includes('fetch('), 'Extracted News display must remain static');
assert.strictEqual((source.match(/function showNews\(/g) || []).length, 1, 'News renderer must have one module owner');
assert(!source.includes('function showNewsFeed('), 'Later inline showNewsFeed surface must remain separate');

console.log('NEWS_DISPLAY_CONTRACT_HARNESS=PASS');
console.log('MODAL_CATEGORIES_ARTICLES_METADATA_FEEDBACK_INLINE_SEPARATION=LOCKED');
console.log('MODULE_OWNER=src/features/news.js');
console.log('PRODUCTION_CHANGE=0');
