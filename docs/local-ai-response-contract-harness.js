const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'local-ai-response.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function getLocalAIResponse(text)',
  'const t = text.toLowerCase()',
  "t.includes('caption')",
  "t.includes('hashtag')",
  "t.includes('idea')",
  "t.includes('post') && !t.includes('upload')",
  "t.includes('bio')",
  "t.includes('reply') || t.includes('smart')",
  "t.match(/who.*(made|created)|tumhe.*(kisne|ne)|who are you|tum kaun/)",
  "t.match(/what.*(can|do)|kya.*(kar|kya)|help|madad/)",
  "t.match(/^(hi|hello|hey|namaste|hola)/)",
  "PROF?.username || 'friend'",
  "t.includes('thank')",
  '// Default',
  'Navigation:',
  'Guides:',
  'Features:',
  'Fun:'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Local AI marker missing: ${marker}`);
}
assert(html.includes('src/features/local-ai-response.js'), 'Local AI module must remain linked from HTML');
assert(!source.includes('db.from('), 'Local AI fallback must not own database writes');
assert(!source.includes('window.location'), 'Local AI fallback must not execute navigation');
assert(!source.includes('sendMessage'), 'Local AI fallback must not send messages');
assert.strictEqual((source.match(/function getLocalAIResponse\(/g) || []).length, 1, 'Local AI fallback must have one module owner');

console.log('LOCAL_AI_RESPONSE_CONTRACT_HARNESS=PASS');
console.log('NORMALIZE_CONTENT_IDENTITY_HELP_PERSONALIZATION_DEFAULT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/local-ai-response.js');
console.log('PRODUCTION_CHANGE=0');
