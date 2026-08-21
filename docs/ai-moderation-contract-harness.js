const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'ai-moderation.js'), 'utf8');

for (const marker of [
  'function moderateContent(text)',
  'const t = text.toLowerCase()',
  "const banned = ['spam', 'scam', 'fake', 'abuse', 'hate', 'violent']",
  'return {flagged: true, reason: word}',
  'return {flagged: false}',
  'const _origSendCmt_v2 = window.sendCmt',
  "document.getElementById('cinp')",
  'const mod = moderateContent(inp.value)',
  "toast('⚠️ Comment flagged for: ' + mod.reason + '. Please follow community guidelines.')",
  'return _origSendCmt.apply(this, arguments)',
  'function initUltraFeatures()',
  'initDynamicUI()',
  "localStorage.getItem('nova-current-mood') || 'default'",
  'const _origInitNova_v2 = window.initNovaFeatures',
  '_origInitNova.apply(this, arguments)',
  'initUltraFeatures()'
]) {
  assert(source.includes(marker), `AI moderation marker missing: ${marker}`);
}
assert.strictEqual((source.match(/return \{flagged: true, reason: word\}/g) || []).length, 1, 'Moderation must flag with the first matching reason');
assert.strictEqual((source.match(/return \{flagged: false\}/g) || []).length, 1, 'Moderation must retain the clean-content path');
assert.strictEqual((source.match(/window\.sendCmt = function\(pid\)/g) || []).length, 1, 'Moderation must install one sendCmt wrapper');
assert.strictEqual((source.match(/_origSendCmt\.apply\(this, arguments\)/g) || []).length, 1, 'Clean comments must delegate with original context and arguments');
assert.strictEqual((source.match(/localStorage\.getItem\('nova-current-mood'\)/g) || []).length, 1, 'Ultra initialization must read the saved mood once');
assert(source.indexOf('_origInitNova.apply(this, arguments)') < source.indexOf('initUltraFeatures();'), 'Nova initialization must precede Ultra initialization');
assert(!source.includes('fetch('), 'AI moderation must not own network requests');
assert(!source.includes('invokeLLM'), 'AI moderation must remain deterministic and service-free');
assert(!source.includes('sendMessage'), 'AI moderation must not own protected messaging');

console.log('AI_MODERATION_CONTRACT_HARNESS=PASS');
console.log('DETERMINISTIC_BANNED_WORDS_SEND_COMMENT_GUARD_DELEGATION_FEEDBACK_ULTRA_INIT_MOOD_STORAGE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/ai-moderation.js');
console.log('PRODUCTION_CHANGE=0');
