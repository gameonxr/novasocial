const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'story-sticker-helpers.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function seOpenStickerTool()',
  "document.getElementById('se-sticker-panel').style.display = 'block'",
  'function seCloseStickerPanel()',
  "document.getElementById('se-sticker-panel').style.display = 'none'",
  'function seAddSticker(emoji)',
  "type: 'sticker'",
  'text: emoji',
  'x: 50',
  'y: 50',
  'scale: 1',
  'rotate: 0',
  'fontSize: 40',
  'renderStoryElements()',
  'function seAddCustomSticker()',
  "document.getElementById('se-custom-sticker').value.trim()",
  'if(!text) return',
  'isText: true',
  "fontFamily: '-apple-system, sans-serif'",
  "color: '#FFFFFF'",
  "document.getElementById('se-custom-sticker').value = ''",
  'seCloseStickerPanel()'
]) {
  assert(source.includes(marker), `Story sticker helper marker missing: ${marker}`);
}
assert(html.includes('src/features/story-sticker-helpers.js'), 'Story sticker helpers module must remain linked from HTML');
assert(!source.includes('fetch('), 'Story sticker helpers must not own network requests');
assert(!source.includes('supabase'), 'Story sticker helpers must not own remote data access');
assert.strictEqual((source.match(/function se(?:OpenStickerTool|CloseStickerPanel|AddSticker|AddCustomSticker)\(/g) || []).length, 4, 'Story sticker helpers must have four owned functions');

console.log('STORY_STICKER_HELPERS_CONTRACT_HARNESS=PASS');
console.log('PANEL_EMOJI_CUSTOM_GUARD_RENDER_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/story-sticker-helpers.js');
console.log('PRODUCTION_CHANGE=0');
