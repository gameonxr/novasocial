const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'fab-speed-dial.js'), 'utf8');

for (const marker of [
  'function toggleFabMenu()',
  "document.getElementById('fab-menu')",
  "document.getElementById('fab-icon')",
  "document.getElementById('fab-main')",
  "if(menu.style.display === 'flex')",
  'closeFabMenu()',
  "{label: 'Post'",
  "{label: 'Reel'",
  "{label: 'Story'",
  "{label: 'Live'",
  "{label: 'Drafts'",
  "showCreate('post')",
  "showCreate('reel')",
  "showCreate('story')",
  'showLiveStreamUI()',
  'showScheduledPosts()',
  'fabRect.left < window.innerWidth / 2',
  "menu.style.display = 'flex'",
  "menu.style.animation = 'novaScaleIn 0.25s ease'",
  "icon.style.transform = 'rotate(45deg)'",
  "fab.style.backdropFilter = 'blur(16px)'",
  'function closeFabMenu()',
  "menu.style.display = 'none'",
  "icon.style.transform = 'rotate(0deg)'",
  "fab.style.backdropFilter = 'none'"
]) {
  assert(source.includes(marker), `FAB speed dial marker missing: ${marker}`);
}
assert.strictEqual((source.match(/\{label:/g) || []).length, 5, 'FAB speed dial must retain five menu items');
assert.strictEqual((source.match(/closeFabMenu\(\);\$\{it\.fn\}/g) || []).length, 1, 'One menu template must close before each delegated action');
assert(source.includes("menu.style.left = (fabRect.left - (isLeftSide ? 0 : 100)) + 'px'"), 'FAB speed dial must preserve side-aware horizontal positioning');
assert(source.includes("menu.style.bottom = (window.innerHeight - fabRect.top + 12) + 'px'"), 'FAB speed dial must preserve above-FAB vertical positioning');
assert(!source.includes('fetch('), 'FAB speed dial must not own network requests');
assert(!source.includes('supabase'), 'FAB speed dial must not own persistence');

console.log('FAB_SPEED_DIAL_CONTRACT_HARNESS=PASS');
console.log('GUARDS_FIVE_ITEMS_DELEGATES_SIDE_POSITIONING_DISPLAY_ANIMATION_ROTATION_CLOSE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/fab-speed-dial.js');
console.log('PRODUCTION_CHANGE=0');
