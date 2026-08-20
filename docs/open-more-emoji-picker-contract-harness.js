const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'open-more-emoji-picker.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function openMoreEmojiPicker(noteId)',
  "panel.id = 'more-emoji-panel'",
  'Apne keyboard se koi bhi emoji chuno',
  "id=\"native-emoji-inp\"",
  'maxlength="4"',
  "submitNativeEmojiReaction('${noteId}')",
  'Send Reaction',
  "document.getElementById('more-emoji-panel').remove()",
  'panel.onclick = e=>{ if(e.target===panel) panel.remove(); }',
  'document.body.appendChild(panel)',
  "document.getElementById('native-emoji-inp')",
  'setTimeout(()=>{ inp?.focus(); }, 150)'
]) {
  assert(source.includes(marker), `Open more emoji picker marker missing: ${marker}`);
}
assert(html.includes('src/features/open-more-emoji-picker.js'), 'Open more emoji picker module must remain linked from HTML');
assert(!source.includes('fetch('), 'Open more emoji picker must not own network requests');
assert(!source.includes('supabase'), 'Open more emoji picker must not own remote data access');
assert.strictEqual((source.match(/function openMoreEmojiPicker\(/g) || []).length, 1, 'Open more emoji picker must have one module owner');

console.log('OPEN_MORE_EMOJI_PICKER_CONTRACT_HARNESS=PASS');
console.log('SHEET_INPUT_LIMIT_REACTION_CLEANUP_NATIVE_FOCUS_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/open-more-emoji-picker.js');
console.log('PRODUCTION_CHANGE=0');
