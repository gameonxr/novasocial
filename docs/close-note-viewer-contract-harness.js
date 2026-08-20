const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'close-note-viewer.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function closeNoteViewer()',
  'if(_noteViewAudio)',
  '_noteViewAudio.pause()',
  '_noteViewAudio=null',
  "document.getElementById('note-view-overlay')",
  "overlay.style.transition = 'opacity 0.2s ease'",
  "overlay.style.opacity = '0'",
  'setTimeout(()=>overlay.remove(), 200)'
]) {
  assert(source.includes(marker), `Close note viewer marker missing: ${marker}`);
}
assert(html.includes('src/features/close-note-viewer.js'), 'Close note viewer module must remain linked from HTML');
assert(!source.includes('fetch('), 'Close note viewer must not own network requests');
assert(!source.includes('supabase'), 'Close note viewer must not own remote data access');
assert(!source.includes('render'), 'Close note viewer must not own note rendering');
assert.strictEqual((source.match(/function closeNoteViewer\(/g) || []).length, 1, 'Close note viewer must have one module owner');

console.log('CLOSE_NOTE_VIEWER_CONTRACT_HARNESS=PASS');
console.log('AUDIO_PAUSE_FADE_DELAYED_REMOVAL_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/close-note-viewer.js');
console.log('PRODUCTION_CHANGE=0');
