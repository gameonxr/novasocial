const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'ai-context.js'), 'utf8');

for (const marker of [
  'let novaAIContext = {',
  'lastCommand: null',
  'lastTopic: null',
  'pendingAction: null',
  'userMood: null',
  'function detectUserMood(text)',
  'const t = text.toLowerCase()',
  'const moods = {',
  'happy:',
  'sad:',
  'angry:',
  'excited:',
  'tired:',
  'motivated:',
  'confused:',
  'Object.entries(moods)',
  'keywords.some(k => t.includes(k))',
  'return mood',
  'return null'
]) {
  assert(source.includes(marker), `AI context marker missing: ${marker}`);
}
const moodOrder = ['happy:', 'sad:', 'angry:', 'excited:', 'tired:', 'motivated:', 'confused:'];
let previous = -1;
for (const marker of moodOrder) {
  const index = source.indexOf(marker);
  assert(index > previous, `Mood order must remain stable for ${marker}`);
  previous = index;
}
assert(!source.includes('fetch('), 'AI context must not own network requests');
assert(!source.includes('supabase'), 'AI context must not own persistence');
assert(!source.includes('invokeLLM'), 'AI context must remain deterministic and service-free');

console.log('AI_CONTEXT_CONTRACT_HARNESS=PASS');
console.log('SHARED_STATE_MOOD_ORDER_KEYWORDS_LOWERCASE_FIRST_MATCH_NULL_FALLBACK_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/ai-context.js');
console.log('PRODUCTION_CHANGE=0');
