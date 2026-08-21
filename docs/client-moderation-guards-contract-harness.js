const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'client-moderation-guards.js'), 'utf8');

for (const marker of [
  'function isBannedClient()',
  'function isMsgBannedClient()',
  'if(PROF && PROF.is_banned === true)',
  'if(PROF && PROF.is_msg_banned === true)',
  "toast('🚫 Your account is suspended.')",
  "toast('🚫 You are restricted from sending messages.')",
  'return true;',
  'return false;'
]) {
  assert(source.includes(marker), `Client moderation guard marker missing: ${marker}`);
}
assert.strictEqual((source.match(/function /g) || []).length, 2, 'Client moderation guards must have two helper owners');
assert.strictEqual((source.match(/return true;/g) || []).length, 2, 'Each moderation guard must return true on its restricted path');
assert.strictEqual((source.match(/return false;/g) || []).length, 2, 'Each moderation guard must return false on its unrestricted path');
assert.strictEqual((source.match(/toast\(/g) || []).length, 2, 'Each moderation guard must emit one exact toast');
assert(!source.includes('fetch('), 'Client moderation guards must not own network requests');
assert(!source.includes('supabase'), 'Client moderation guards must not own persistence');
assert(!/PROF\.is_banned\s*=(?!=)/.test(source), 'Client moderation guards must not mutate profile flags');
assert(!/PROF\.is_msg_banned\s*=(?!=)/.test(source), 'Client moderation guards must not mutate message-ban flags');

console.log('CLIENT_MODERATION_GUARDS_CONTRACT_HARNESS=PASS');
console.log('PROFILE_BAN_MESSAGE_BAN_TOASTS_BOOLEAN_PATHS_SIDE_EFFECT_FREE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/client-moderation-guards.js');
console.log('PRODUCTION_CHANGE=0');
