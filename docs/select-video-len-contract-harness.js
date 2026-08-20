const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'select-video-len.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function selectVideoLen(s)',
  'window._videoTrimTo=s',
  "document.querySelectorAll('.vlen-pill')",
  '.forEach(p=>',
  "s==='full'&&p.dataset.s==='full'",
  'p.dataset.s==String(s)',
  "p.style.background=match?'#fff':'#1a1a1a'",
  "p.style.color=match?'#000':'#aaa'"
]) {
  assert(source.includes(marker), `Select video length marker missing: ${marker}`);
}
assert(html.includes('src/features/select-video-len.js'), 'Select video length module must remain linked from HTML');
assert(!source.includes('fetch('), 'Select video length must not own network requests');
assert(!source.includes('supabase'), 'Select video length must not own remote data access');
assert.strictEqual((source.match(/function selectVideoLen\(/g) || []).length, 1, 'Select video length must have one module owner');

console.log('SELECT_VIDEO_LEN_CONTRACT_HARNESS=PASS');
console.log('TRIM_STATE_FULL_NUMBER_MATCH_PILL_STYLES_UI_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/select-video-len.js');
console.log('PRODUCTION_CHANGE=0');
