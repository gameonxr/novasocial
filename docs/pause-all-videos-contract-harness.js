const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'pause-all-videos.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function pauseAllVideos()',
  "document.querySelectorAll('video')",
  '.forEach(v=>',
  'try{v.pause();}',
  'catch(e){}'
]) {
  assert(source.includes(marker), `Pause all videos marker missing: ${marker}`);
}
assert(html.includes('src/features/pause-all-videos.js'), 'Pause all videos module must remain linked from HTML');
assert(!source.includes('fetch('), 'Pause all videos must not own network requests');
assert(!source.includes('supabase'), 'Pause all videos must not own remote data access');
assert(!source.includes('play()'), 'Pause all videos must not start playback');
assert.strictEqual((source.match(/function pauseAllVideos\(/g) || []).length, 1, 'Pause all videos must have one module owner');

console.log('PAUSE_ALL_VIDEOS_CONTRACT_HARNESS=PASS');
console.log('VIDEO_SELECTION_GUARDED_PAUSE_EXCEPTION_TOLERANCE_DOM_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/pause-all-videos.js');
console.log('PRODUCTION_CHANGE=0');
