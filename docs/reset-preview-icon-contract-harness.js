const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'reset-preview-icon.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function resetPreviewIcon(idx)',
  "document.getElementById('preview-icon-'+idx)",
  'if(icon)',
  "icon.innerHTML = '<polygon points=\"5 3 19 12 5 21 5 3\"/>'"
]) {
  assert(source.includes(marker), `Reset preview icon marker missing: ${marker}`);
}
assert(html.includes('src/features/reset-preview-icon.js'), 'Reset preview icon module must remain linked from HTML');
assert(!source.includes('playbackRate'), 'Reset preview icon must not mutate playback rate');
assert(!source.includes('.play()'), 'Reset preview icon must not start playback');
assert(!source.includes('.pause()'), 'Reset preview icon must not pause playback');
assert(!source.includes('fetch('), 'Reset preview icon must not own network requests');
assert(!source.includes('supabase'), 'Reset preview icon must not own remote data access');
assert.strictEqual((source.match(/function resetPreviewIcon\(/g) || []).length, 1, 'Reset preview icon must have one module owner');

console.log('RESET_PREVIEW_ICON_CONTRACT_HARNESS=PASS');
console.log('INDEXED_LOOKUP_MISSING_GUARD_PLAY_POLYGON_RENDERER_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/reset-preview-icon.js');
console.log('PRODUCTION_CHANGE=0');
