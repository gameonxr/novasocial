const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'prev-media.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function prevMedia(inp,type)',
  'const f=inp.files[0];if(!f)return',
  'URL.createObjectURL(f)',
  "document.getElementById('mprev')",
  'window._videoTrimTo=null',
  "window._selectedFilter='none'",
  "f.type.startsWith('video/')",
  '<video id="mprev-media"',
  "probe.preload='metadata'",
  'probe.onloadedmetadata=',
  'window._videoFullDuration=probe.duration',
  'showVideoLengthOptions(probe.duration)',
  "document.getElementById('post-edit-tools').style.display='flex'",
  'showFilterTray(url)',
  '<img id="mprev-media"',
  "document.getElementById('vlenpick')",
  "vp.style.display='none'",
  "document.getElementById('cbtn')",
  "btn.disabled=false",
  "btn.style.opacity='1'"
]) {
  assert(source.includes(marker), `Prev media marker missing: ${marker}`);
}
assert(html.includes('src/features/prev-media.js'), 'Prev media module must remain linked from HTML');
assert(!source.includes('fetch('), 'Prev media must not own network requests');
assert(!source.includes('supabase'), 'Prev media must not own remote data access');
assert.strictEqual((source.match(/function prevMedia\(/g) || []).length, 1, 'Prev media must have one module owner');

console.log('PREV_MEDIA_CONTRACT_HARNESS=PASS');
console.log('GUARD_PREVIEW_VIDEO_IMAGE_METADATA_TOOLS_ENABLE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/prev-media.js');
console.log('PRODUCTION_CHANGE=0');
