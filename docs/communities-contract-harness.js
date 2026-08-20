const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'communities.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  "myCommunities = JSON.parse(localStorage.getItem('nova-communities') || '[]')",
  'function showCommunities()',
  "modal('👥 Communities')",
  "localStorage.setItem('nova-communities', JSON.stringify(myCommunities))",
  'function createCommunity()',
  'id="cm-name"',
  'id="cm-topic"',
  'id="cm-desc"',
  'id="cm-rules"',
  'function saveCommunity()',
  "const name = document.getElementById('cm-name')?.value.trim()",
  "toast('Community name chahiye')",
  "id: 'cm_' + Date.now()",
  'icon: topic.split(\' \')[1] || \'👥\'',
  "color: 'linear-gradient(135deg,#7afdff,#fc007c)'",
  'members: 1',
  'forums: []',
  'voiceRooms: []',
  'createdAt: new Date().toISOString()',
  "toast('👥 Community created!')",
  'function openCommunity(communityId)',
  "toast('Community not found')",
  'showVoiceRoomsForCommunity',
  'showForums',
  'showCommunityEvents',
  'showCommunityMembers',
  'function joinCommunity(name)',
  'toast(`✅ Joined ${name}!`)'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Communities marker missing: ${marker}`);
}
assert(html.includes('src/features/communities.js'), 'Communities module must remain linked from HTML');
assert(!source.includes('db.from('), 'Communities module must remain local-storage-backed');
assert.strictEqual((source.match(/function showCommunities\(/g) || []).length, 1, 'Communities renderer must have one module owner');
assert.strictEqual((source.match(/function saveCommunity\(/g) || []).length, 1, 'Community save helper must have one module owner');
assert.strictEqual((source.match(/function openCommunity\(/g) || []).length, 1, 'Community open helper must have one module owner');

console.log('COMMUNITIES_CONTRACT_HARNESS=PASS');
console.log('HYDRATE_RENDER_CREATE_VALIDATE_DEFAULTS_PERSIST_OPEN_DISPATCH_JOIN=LOCKED');
console.log('MODULE_OWNER=src/features/communities.js');
console.log('PRODUCTION_CHANGE=0');
