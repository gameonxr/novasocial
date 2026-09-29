const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'groups', 'copy-invite-link.js') /* architecture-migration 2026-09-29: groups folder */, 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29: calls/groups demand loading */

for (const marker of [
  'function copyInviteLink(link)',
  'try {',
  'navigator.clipboard.writeText(link)',
  "toast('Invite link copied! 📋')",
  'catch(e)',
  "toast('Could not copy')"
]) {
  assert(source.includes(marker), `Copy invite link marker missing: ${marker}`);
}
assert(featureManifestSrc.includes('"src/features/groups/copy-invite-link.js"'), 'Copy invite link module must remain linked from HTML (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29: groups folder */
assert(!source.includes('fetch('), 'Copy invite link must not own network requests');
assert(!source.includes('supabase'), 'Copy invite link must not own remote data access');
assert(!source.includes('localStorage'), 'Copy invite link must not own persistence');
assert.strictEqual((source.match(/function copyInviteLink\(/g) || []).length, 1, 'Copy invite link must have one module owner');

console.log('COPY_INVITE_LINK_CONTRACT_HARNESS=PASS');
console.log('CLIPBOARD_SUCCESS_ERROR_TOAST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/groups/copy-invite-link.js');
console.log('PRODUCTION_CHANGE=0');
