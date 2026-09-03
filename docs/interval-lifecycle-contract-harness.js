const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const files = [path.join(repo, 'index.html'), ...execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const managed = [
  { handle: '_emergencyLockTimer', create: '_emergencyLockTimer = setInterval', cleanup: 'clearInterval(_emergencyLockTimer)' },
  { handle: '_banRecheckTimer', create: '_banRecheckTimer = setInterval', cleanup: 'clearInterval(_banRecheckTimer)' },
  { handle: 'svTimer', create: 'svTimer = setInterval', cleanup: 'clearInterval(svTimer)' },
  { handle: 'window._networkMonitorInterval', create: 'window._networkMonitorInterval = setInterval', cleanup: 'clearInterval(window._networkMonitorInterval)' },
  { handle: '_callState.timerInterval', create: '_callState.timerInterval = setInterval', cleanup: 'clearInterval(_callState.timerInterval)' },
  { handle: 'window._liveInterval', create: 'window._liveInterval = setInterval', cleanup: 'clearInterval(window._liveInterval)' },
];

assert.strictEqual(files.length, 396, 'index.html plus 240 extracted modules must be audited after the DMs renderer split');
assert.strictEqual((source.match(/setInterval\(/g) || []).length, 7, 'seven interval registrations must remain');
assert.strictEqual((source.match(/clearInterval\(/g) || []).length, 10, 'ten interval cleanup calls must remain');
for (const item of managed) {
  assert(source.includes(item.create), `${item.handle} must retain interval creation`);
  assert(source.includes(item.cleanup), `${item.handle} must retain interval cleanup`);
}
assert(source.includes('setInterval(applyDynamicBackground, 60000)'), 'Nova Universe dynamic background interval must remain present');

console.log('INTERVAL_LIFECYCLE_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log('SET_INTERVAL_CALLS=7');
console.log('CLEAR_INTERVAL_CALLS=10');
console.log('MANAGED_INTERVAL_HANDLES=6');
console.log('NOVA_UNIVERSE_INTERVAL=PASS');
console.log('RUNTIME_TIMERS_STARTED=0');
