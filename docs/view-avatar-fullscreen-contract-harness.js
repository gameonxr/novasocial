const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'view-avatar-fullscreen.js'), 'utf8');

for (const marker of [
  'function viewAvatarFullscreen(avatarUrl, username)',
  'if(!avatarUrl)',
  "toast('Koi profile photo nahi hai')",
  "document.getElementById('nova-avatar-viewer')?.remove()",
  "modal.id = 'nova-avatar-viewer'",
  'modal.style.cssText =',
  'onclick="document.getElementById(\'nova-avatar-viewer\').remove()"',
  'esc(username)',
  '<img src="${avatarUrl}"',
  'modal.onclick = (e) => { if(e.target === modal) modal.remove(); };',
  'document.body.appendChild(modal)'
]) {
  assert(source.includes(marker), `View avatar fullscreen marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'View avatar fullscreen must not own network requests');
assert(!source.includes('localStorage'), 'View avatar fullscreen must not own persistence');
assert.strictEqual((source.match(/function viewAvatarFullscreen\(/g) || []).length, 1, 'View avatar fullscreen must have one module owner');

console.log('VIEW_AVATAR_FULLSCREEN_CONTRACT_HARNESS=PASS');
console.log('GUARD_REPLACEMENT_ESCAPED_USERNAME_CLOSE_BACKDROP_INSERTION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/view-avatar-fullscreen.js');
console.log('PRODUCTION_CHANGE=0');
