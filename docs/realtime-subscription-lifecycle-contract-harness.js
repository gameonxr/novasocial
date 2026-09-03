const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const files = [path.join(repo, 'index.html'), ...execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const channelNames = [
  'chat-', 'typing-', 'incoming-calls-', 'call-signals-', 'call-status-',
  'group-signals-', 'group-participants-', 'notifs-', 'self-profile-', 'notes-realtime',
];
const managedSlots = [
  'window.chatSubscription', 'window.typingSub', 'window._callIncomingSubscription',
  '_callState.signalSub', 'window._callStatusSub', '_groupCallState.signalsSub',
  '_groupCallState.participantsSub', 'window.notifsSub', 'window._selfProfileSub', 'window._notesSub',
];

assert.strictEqual(files.length, 389, 'index.html plus 240 extracted modules must be audited after the DMs renderer split');
assert.strictEqual((source.match(/\.channel\(/g) || []).length, 10, '10 Supabase realtime channels must remain registered');
assert.strictEqual((source.match(/removeChannel\(/g) || []).length, 21, '21 existing cleanup calls must remain present');
for (const name of channelNames) {
  assert(source.includes(`channel('${name}`) || source.includes(`channel(\"${name}`), `channel family must remain present: ${name}`);
}
for (const slot of managedSlots) {
  const assignment = new RegExp(`${slot.replace(/\./g, '\\.')}\\s*=`);
  assert(assignment.test(source), `managed channel slot assignment must remain: ${slot}`);
  assert(source.includes(`removeChannel(${slot}`) || source.includes(`removeChannel(${slot.replace(/^window\./, '')}`), `managed channel slot must retain cleanup reference: ${slot}`);
}
const channelBlocks = [...source.matchAll(/\.channel\([\s\S]*?\.subscribe\(\)/g)];
assert.strictEqual(channelBlocks.length, 10, 'every realtime channel registration must retain a subscribe chain');
assert(source.includes('existingSub.unsubscribe()'), 'browser PushManager unsubscribe must remain distinct from Supabase channel cleanup');

console.log('REALTIME_SUBSCRIPTION_LIFECYCLE_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log('CHANNEL_REGISTRATIONS=10');
console.log('SUBSCRIBED_CHANNELS=10');
console.log('MANAGED_SLOTS=10');
console.log('REMOVE_CHANNEL_CALLS=21');
console.log('PUSH_MANAGER_DISTINCT=PASS');
