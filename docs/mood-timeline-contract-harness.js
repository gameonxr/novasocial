const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'mood-timeline.js'), 'utf8');

for (const marker of [
  'function showMoodTimeline()',
  "document.getElementById('screen')",
  'const mockMoods = [',
  "{date:'Today', mood:'happy', emoji:'😊', posts:3}",
  "{date:'Yesterday', mood:'excited', emoji:'🤩', posts:5}",
  "{date:'2 days ago', mood:'calm', emoji:'😌', posts:2}",
  "{date:'3 days ago', mood:'motivated', emoji:'💪', posts:4}",
  "{date:'1 week ago', mood:'creative', emoji:'🎨', posts:6}",
  'Mood Timeline',
  'Mood Journey',
  'onclick="goBack()"',
  'Timeline Line',
  'mockMoods.map',
  'Mood Insights',
  'dominant mood last week'
]) {
  assert(source.includes(marker), `Mood timeline marker missing: ${marker}`);
}
assert.strictEqual((source.match(/date:'/g) || []).length, 5, 'Mood timeline must retain five date fixtures');
assert.strictEqual((source.match(/mood:'/g) || []).length, 5, 'Mood timeline must retain five mood fixtures');
assert.strictEqual((source.match(/posts:/g) || []).length, 5, 'Mood timeline must retain five post counts');
assert.strictEqual((source.match(/mockMoods\.map/g) || []).length, 1, 'Mood timeline must use one repeated entry template');
assert(!source.includes('fetch('), 'Mood timeline must not own network requests');
assert(!source.includes('supabase'), 'Mood timeline must not own persistence');
assert(!source.includes('invokeLLM'), 'Mood timeline must remain display-only');

console.log('MOOD_TIMELINE_CONTRACT_HARNESS=PASS');
console.log('SCREEN_RENDER_FIVE_MOODS_TIMELINE_BACK_NAV_POST_METADATA_INSIGHTS_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/mood-timeline.js');
console.log('PRODUCTION_CHANGE=0');
