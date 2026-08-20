const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-preview-play.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const searchRenderer = fs.readFileSync(path.join(repo, 'src', 'features', 'search-music-for-note.js'), 'utf8');

for (const marker of [
  'function togglePreviewPlay(idx, url)',
  "if(!url){ toast('Preview available nahi hai is gaane ka'); return; }",
  'if(_previewPlayingIdx === idx && _previewAudio && !_previewAudio.paused)',
  '_previewAudio.pause()',
  'resetPreviewIcon(idx)',
  '_previewPlayingIdx = null',
  'new Audio(url)',
  '_previewAudio.play().catch(()=>toast(\'Preview play nahi hua\'))',
  "document.getElementById('preview-icon-'+idx)",
  "_previewAudio.onended = ()=>{ resetPreviewIcon(idx); _previewPlayingIdx=null; }"
]) {
  assert(source.includes(marker), `Toggle preview play marker missing: ${marker}`);
}
assert(searchRenderer.includes('togglePreviewPlay('), 'Note-music search UI must retain the preview-play handler');
assert(!source.includes('fetch('), 'Toggle preview play must not own network requests');
assert(!source.includes('saveRecentMusic'), 'Toggle preview play must not own recents persistence');
assert.strictEqual((source.match(/function togglePreviewPlay\(/g) || []).length, 1, 'Toggle preview play must have one module owner');

console.log('TOGGLE_PREVIEW_PLAY_CONTRACT_HARNESS=PASS');
console.log('GUARDS_AUDIO_LIFECYCLE_ICON_TRANSITIONS_ENDED_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-preview-play.js');
console.log('PRODUCTION_CHANGE=0');
