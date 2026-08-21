const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'fallback-local-queue.js'), 'utf8');

for (const marker of [
  'function _fallbackLocalQueue(mediaUrl, source, reason)',
  "localStorage.getItem('_mediaDeleteFallback')",
  "|| '[]'",
  'pending.push({ mediaUrl, source, reason, ts: Date.now() })',
  'if(pending.length > 500)',
  'pending.splice(0, 100)',
  "localStorage.setItem('_mediaDeleteFallback', JSON.stringify(pending))",
  "console.warn('Local fallback queue failed:', e)"
]) {
  assert(source.includes(marker), `Fallback queue marker missing: ${marker}`);
}
assert.strictEqual((source.match(/localStorage\./g) || []).length, 2, 'Fallback queue must read and write local storage once each');
assert.strictEqual((source.match(/pending\.push\(/g) || []).length, 1, 'Fallback queue must append one payload');
assert.strictEqual((source.match(/pending\.length > 500/g) || []).length, 1, 'Fallback queue must retain the 500-item cap');
assert.strictEqual((source.match(/splice\(0, 100\)/g) || []).length, 1, 'Fallback queue must trim the oldest 100 items');
assert(source.includes('Date.now()'), 'Fallback queue must timestamp each entry');
assert(!source.includes('fetch('), 'Fallback queue must not own network requests');
assert(!source.includes('supabase'), 'Fallback queue must remain local-only');
assert(!source.includes('remove('), 'Fallback queue must not perform media deletion');

console.log('FALLBACK_LOCAL_QUEUE_CONTRACT_HARNESS=PASS');
console.log('LOCAL_READ_APPEND_TIMESTAMP_CAP_TRIM_WRITE_WARNING_ONLY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/fallback-local-queue.js');
console.log('PRODUCTION_CHANGE=0');
