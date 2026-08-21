const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'memories.js'), 'utf8');

for (const marker of [
  'async function showMemories()',
  "document.getElementById('screen')",
  '<div class="ldiv"><div class="spin"></div></div>',
  'const oneYearAgo = new Date()',
  'oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)',
  'oneYearAgoEnd.setDate(oneYearAgoEnd.getDate() + 7)',
  "db.from('posts')",
  "select('*,profiles!posts_user_id_fkey(username,avatar_url)')",
  '.eq(\'user_id\', ME.id)',
  ".gte('created_at', oneYearAgo.toISOString())",
  ".lt('created_at', oneYearAgoEnd.toISOString())",
  ".order('created_at', {ascending:false})",
  '.limit(10)',
  'const thisWeekLastYear = (memories || []).filter',
  'return d.getDate() === now.getDate() && d.getMonth() === now.getMonth()',
  'On This Day',
  'showMoodTimeline()',
  'Koi memory nahi',
  "viewPost('${p.id}')",
  '1 YEAR AGO',
  "p.caption.substring(0,100)",
  'AI Memory Timeline',
  'Memories load nahi ho payi.'
]) {
  assert(source.includes(marker), `Memories marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.from\('posts'\)/g) || []).length, 1, 'Memories must own one posts query');
assert.strictEqual((source.match(/\.limit\(10\)/g) || []).length, 1, 'Memories must retain the ten-post cap');
assert.strictEqual((source.match(/viewPost\('\$\{p\.id\}'\)/g) || []).length, 1, 'Memories must use one post-navigation template');
assert.strictEqual((source.match(/showMoodTimeline\(\)/g) || []).length, 1, 'Memories must retain one mood-timeline navigation boundary');
assert(source.includes('p.media_type===\'video\''), 'Memories must preserve video-media handling');
assert(source.includes('cldUrl('), 'Memories must preserve transformed media URLs');
assert(!source.includes('sendMessage'), 'Memories must not own protected messaging');
assert(!source.includes('renderReels'), 'Memories must not own the protected Reels renderer');

console.log('MEMORIES_CONTRACT_HARNESS=PASS');
console.log('DATE_WINDOWS_POST_QUERY_SAME_DAY_EMPTY_ERROR_MEDIA_CAPTION_NAV_MOOD_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/memories.js');
console.log('PRODUCTION_CHANGE=0');
