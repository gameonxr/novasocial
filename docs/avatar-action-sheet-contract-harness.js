const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'avatar-action-sheet.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function showAvatarActionSheet()',
  "document.getElementById('avatar-action-sheet')?.remove()",
  "sheet.id = 'avatar-action-sheet'",
  'position:fixed;inset:0',
  'PROF?.avatar_url',
  "viewAvatarFullscreen('${PROF.avatar_url}','${esc(PROF.username)||''}')",
  '👁 View Photo',
  "document.getElementById('avpick').click()",
  '📷 Change Photo',
  "onclick=\"document.getElementById('avatar-action-sheet').remove()\"",
  'Cancel',
  'sheet.onclick = (e) => { if(e.target === sheet) sheet.remove(); }',
  'document.body.appendChild(sheet)'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Avatar sheet marker missing: ${marker}`);
}
assert(html.includes('src/features/avatar-action-sheet.js'), 'Avatar action-sheet module must remain linked from HTML');
assert(!source.includes('db.from('), 'Avatar action sheet must not own persistence');
assert(!source.includes('upload'), 'Avatar action sheet must not own upload processing');
assert.strictEqual((source.match(/function showAvatarActionSheet\(/g) || []).length, 1, 'Avatar action sheet must have one module owner');

console.log('AVATAR_ACTION_SHEET_CONTRACT_HARNESS=PASS');
console.log('REPLACE_VIEW_CHANGE_CANCEL_BACKDROP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/avatar-action-sheet.js');
console.log('PRODUCTION_CHANGE=0');
