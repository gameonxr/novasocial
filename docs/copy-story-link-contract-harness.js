const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'copy-story-link.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'async function copyStoryLink(id)',
  'navigator.clipboard.writeText(window.location.origin + \'/?story=\' + id)',
  "toast('Story link copied! 📋')",
  'closeModal()',
  'catch(e)',
  "toast('Could not copy')"
]) {
  assert(source.includes(marker), `Copy story link marker missing: ${marker}`);
}
assert(html.includes('src/features/copy-story-link.js'), 'Copy story link module must remain linked from HTML');
assert(!source.includes('fetch('), 'Copy story link must not own network requests');
assert(!source.includes('supabase'), 'Copy story link must not own remote data access');
assert(!source.includes('localStorage'), 'Copy story link must not own persistence');
assert.strictEqual((source.match(/function copyStoryLink\(/g) || []).length, 1, 'Copy story link must have one module owner');

console.log('COPY_STORY_LINK_CONTRACT_HARNESS=PASS');
console.log('URL_CLIPBOARD_SUCCESS_ERROR_MODAL_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/copy-story-link.js');
console.log('PRODUCTION_CHANGE=0');
