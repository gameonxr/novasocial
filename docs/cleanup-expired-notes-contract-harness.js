const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'cleanup-expired-notes.js'), 'utf8');

for (const marker of [
  'async function cleanupExpiredNotes()',
  'if(window._expiredNotesCleaned) return;',
  'window._expiredNotesCleaned = true;',
  "db\n      .from('quick_notes')",
  ".select('id, music_artwork')",
  ".lt('expires_at', new Date().toISOString())",
  '.limit(100)',
  "if(!expired?.length) return;",
  "url.includes('cloudinary.com')",
  "deleteMultipleMediaProduction(mediaUrls, 'note', 'expired_story')",
  "db.from('quick_note_views').delete().in('note_id', ids)",
  "db.from('quick_note_reactions').delete().in('note_id', ids)",
  "await Promise.allSettled([",
  "db.from('quick_notes').delete().in('id', ids)",
  "console.log(`✅ ${expired.length} expired notes cleaned up`)",
  "console.error('Notes cleanup error (non-critical):', e)"
]) {
  assert(source.includes(marker), `Expired-note cleanup marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.from\(/g) || []).length, 3, 'cleanup must retain the related-data and primary-note deletion boundaries');
assert.strictEqual((source.match(/delete\(\)/g) || []).length, 3, 'cleanup must delete views, reactions, and expired notes');
assert(source.includes('.map(n => n.music_artwork)'), 'cleanup must derive media candidates from artwork');
assert(source.includes('.filter(url => url && url.includes(\'cloudinary.com\'))'), 'cleanup must restrict media deletion to Cloudinary URLs');
assert(source.includes('const ids = expired.map(n => n.id);'), 'cleanup must derive note IDs once for related cleanup');
assert(source.includes('try {') && source.includes('} catch(e) {'), 'cleanup must retain its non-critical error boundary');
assert(!source.includes('signInWithPassword'), 'cleanup must not own authentication');
assert(!source.includes('navigator.mediaDevices'), 'cleanup must not own recording or calls');

console.log('CLEANUP_EXPIRED_NOTES_CONTRACT_HARNESS=PASS');
console.log('ONE_SHOT_QUERY_BOUND_MEDIA_RELATED_DATA_NOTE_DELETE_ERROR_BOUNDARY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/cleanup-expired-notes.js');
console.log('PRODUCTION_CHANGE=0');
