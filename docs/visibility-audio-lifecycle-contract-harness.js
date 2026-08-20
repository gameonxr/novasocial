const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
assert.strictEqual((html.match(/document\.addEventListener\(['"]visibilitychange['"]/g) || []).length, 1, 'one visibilitychange listener must remain');
assert.strictEqual((html.match(/if\(document\.hidden\)/g) || []).length, 1, 'one document.hidden guard must remain');
for (const audio of ['_noteViewAudio', '_previewAudio', '_segmentAudio']) {
  assert(html.includes(`if(${audio}){ ${audio}.pause(); }`), `${audio} must pause when the document is hidden`);
}
const listenerStart = html.indexOf("document.addEventListener('visibilitychange'");
const listenerEnd = html.indexOf('\n});', listenerStart);
assert(listenerStart >= 0 && listenerEnd > listenerStart, 'visibility handler boundary must remain extractable');
const listener = html.slice(listenerStart, listenerEnd);
assert.strictEqual((listener.match(/\.pause\(\)/g) || []).length, 3, 'visibility handler must retain exactly three audio pauses');
assert(!listener.includes('.play()'), 'visibility handler must not introduce a resume operation');

console.log('VISIBILITY_AUDIO_LIFECYCLE_HARNESS=PASS');
console.log('VISIBILITY_LISTENERS=1');
console.log('HIDDEN_AUDIO_PAUSES=3');
console.log('RESUME_POLICY_CHANGED=0');
console.log('PROTECTED_INLINE_BOUNDARY=PASS');
