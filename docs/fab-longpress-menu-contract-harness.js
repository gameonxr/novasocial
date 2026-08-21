const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'fab-longpress-menu.js'), 'utf8');

for (const marker of [
  'function showFabLongPressMenu()',
  "document.getElementById('fab-longpress-menu')",
  "document.getElementById('fab-main')",
  'getBoundingClientRect()',
  "menu.style.display = 'flex'",
  "menu.style.animation = 'novaScaleIn 0.2s ease'",
  'let menuLeft = rect.left',
  'let menuTop = rect.top - 200',
  'if(menuTop < 10) menuTop = rect.bottom + 10',
  'if(menuLeft + 180 > window.innerWidth) menuLeft = window.innerWidth - 190',
  "menu.style.left = menuLeft + 'px'",
  "menu.style.top = menuTop + 'px'",
  'function closeFabLongPressMenu()',
  "menu.style.display = 'none'"
]) {
  assert(source.includes(marker), `FAB long-press menu marker missing: ${marker}`);
}
assert.strictEqual((source.match(/getElementById\(/g) || []).length, 3, 'FAB long-press menu must perform two show lookups and one close lookup');
assert.strictEqual((source.match(/menu\.style\.display/g) || []).length, 2, 'FAB long-press menu must set display for open and close');
assert(source.includes('rect.bottom + 10'), 'FAB long-press menu must preserve below-FAB fallback');
assert(source.includes('window.innerWidth - 190'), 'FAB long-press menu must preserve right-edge clamp');
assert(!source.includes('fetch('), 'FAB long-press menu must not own network requests');
assert(!source.includes('supabase'), 'FAB long-press menu must not own persistence');

console.log('FAB_LONGPRESS_MENU_CONTRACT_HARNESS=PASS');
console.log('GUARDS_DISPLAY_ANIMATION_ABOVE_BELOW_PLACEMENT_VIEWPORT_CLAMP_CLOSE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/fab-longpress-menu.js');
console.log('PRODUCTION_CHANGE=0');
