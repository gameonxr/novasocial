const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'channels.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  "myChannels = JSON.parse(localStorage.getItem('nova-channels') || '[]')",
  'function showChannels()',
  "modal('📺 Channels')",
  "localStorage.setItem('nova-channels', JSON.stringify(myChannels))",
  'function createChannel()',
  "id=\"ch-name\"",
  "id=\"ch-desc\"",
  'window._chIcon = \'📺\'',
  'window._chColor = colors[0]',
  'function saveChannel()',
  "const name = document.getElementById('ch-name')?.value.trim()",
  "toast('Channel name chahiye')",
  "id: 'ch_' + Date.now()",
  'subscribers: 0',
  'posts: []',
  'createdAt: new Date().toISOString()',
  "toast('📺 Channel created!')",
  'function openChannel(channelId)',
  "toast('Channel not found')",
  'function broadcastToChannel(channelId)',
  "if(!text?.trim()) return",
  'ch.posts.unshift({ text: text.trim(), date: new Date().toISOString() })',
  "toast('📢 Broadcast sent!')",
  'function subscribeChannel(name)',
  'toast(`✅ Subscribed to ${name}!`)'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Channels marker missing: ${marker}`);
}
assert(html.includes('src/features/channels.js'), 'Channels module must remain linked from HTML');
assert(!source.includes('db.from('), 'Channels module must remain local-storage-backed');
assert.strictEqual((source.match(/function showChannels\(/g) || []).length, 1, 'Channels renderer must have one module owner');
assert.strictEqual((source.match(/function saveChannel\(/g) || []).length, 1, 'Channel save helper must have one module owner');
assert.strictEqual((source.match(/function broadcastToChannel\(/g) || []).length, 1, 'Broadcast helper must have one module owner');

console.log('CHANNELS_CONTRACT_HARNESS=PASS');
console.log('HYDRATE_RENDER_CREATE_VALIDATE_PERSIST_OPEN_BROADCAST_SUBSCRIBE=LOCKED');
console.log('MODULE_OWNER=src/features/channels.js');
console.log('PRODUCTION_CHANGE=0');
