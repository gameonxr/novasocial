const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const files = [path.join(repo, 'index.html'), ...execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const expectedKeys = [
  '_mediaDeleteFallback', '_navDebugLog', '_pendingDeletes', 'fav_stickers', 'nova-2fa-enabled',
  'nova-ai-fab-visible', 'nova-ai-pos', 'nova-calendar-events', 'nova-channels', 'nova-communities',
  'nova-cover-url', 'nova-current-mood', 'nova-dm-drafts', 'nova-fab-hidden', 'nova-fab-pos',
  'nova-fab-size', 'nova-fab-style', 'nova-interests', 'nova-journal', 'nova-last-screen',
  'nova-notes', 'nova-scheduled', 'nova-theme', 'nova-theme-fab-visible', 'nova_accounts',
  'nova_cld_idx', 'nova_cld_month', 'nova_recent_music', 'recent_stickers',
].sort();
const matches = [...source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const actualKeys = [...new Set(matches)].sort();
const unexpected = actualKeys.filter((key) => !expectedKeys.includes(key));
const missing = expectedKeys.filter((key) => !actualKeys.includes(key));

assert.strictEqual(files.length, 246, 'index.html plus 240 extracted modules must be audited after the DMs renderer split');
assert.strictEqual((source.match(/sessionStorage\./g) || []).length, 0, 'sessionStorage must remain unused');
assert.strictEqual(actualKeys.length, 29, '29 literal localStorage keys must remain');
assert.deepStrictEqual(unexpected, [], 'no unexpected literal localStorage keys may appear');
assert.deepStrictEqual(missing, [], 'all established literal localStorage keys must remain');
assert.deepStrictEqual(actualKeys, expectedKeys, 'literal localStorage allowlist must remain stable');
assert(source.includes("type+'_stickers'"), 'dynamic sticker storage family must remain represented outside the literal allowlist');

console.log('STORAGE_KEY_SURFACE_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log('LITERAL_LOCAL_STORAGE_KEYS=29');
console.log('SESSION_STORAGE_REFERENCES=0');
console.log('UNEXPECTED_KEYS=0');
console.log('MISSING_KEYS=0');
console.log('DYNAMIC_STICKER_FAMILY=PASS');
