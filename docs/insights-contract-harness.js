const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'insights.js'), 'utf8');

for (const marker of [
  'async function showEnhancedInsights(pid)',
  "modal('📊 Post Insights')",
  "m.querySelector('#mbody')",
  '<div class="ldiv"><div class="spin"></div></div>',
  'await Promise.all([',
  "db.from('posts').select('*,profiles!posts_user_id_fkey(username)').eq('id',pid).single()",
  "db.from('post_views').select('created_at').eq('post_id',pid)",
  "if(!p){ body.innerHTML='<div style=\"padding:20px;text-align:center;color:#666\">Post not found</div>'; return; }",
  'Array.from({length:24}',
  'Math.max(...viewCounts)',
  'Likes ❤️',
  'Comments 💬',
  'Views 👁️',
  'VIEWS OVER 24 HOURS',
  'mini-chart',
  'ENGAGEMENT RATE',
  '.toFixed(1)}%',
  'Excellent engagement!',
  'Good performance',
  'TOP REACTIONS',
  "{emoji:'❤️', label:'Heart', pct:60",
  "{emoji:'🔥', label:'Fire', pct:20",
  "{emoji:'😍', label:'Love', pct:12",
  "{emoji:'👏', label:'Clap', pct:8"
]) {
  assert(source.includes(marker), `Insights marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.from\(/g) || []).length, 2, 'Insights must retain one post query and one view query');
assert.strictEqual((source.match(/length:24/g) || []).length, 1, 'Insights must retain 24 hourly values');
assert.strictEqual((source.match(/label:'/g) || []).length, 4, 'Insights must retain four reaction fixtures');
assert(source.includes("/(p.views_count||1)*100"), 'Insights must preserve the guarded engagement denominator');
assert(source.includes(">5?'🔥':'📈'"), 'Insights must preserve the engagement icon threshold');
assert(source.includes(">5?'Excellent engagement!':'Good performance'"), 'Insights must preserve the engagement copy threshold');
assert(!source.includes('renderReels'), 'Insights must not own the protected Reels renderer');
assert(!source.includes('renderDMs'), 'Insights must not own the protected DM renderer');

console.log('INSIGHTS_CONTRACT_HARNESS=PASS');
console.log('MODAL_LOADING_DUAL_QUERY_NOT_FOUND_24H_CHART_STATS_ENGAGEMENT_REACTIONS_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/insights.js');
console.log('PRODUCTION_CHANGE=0');
