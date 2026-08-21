const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'fab-customization.js'), 'utf8');

for (const marker of [
  'function changeFabSize()',
  'const sizes = [44, 52, 60, 68]',
  'sizes.indexOf(fabSize)',
  'fabSize = sizes[(currentIdx + 1) % sizes.length]',
  "localStorage.setItem('nova-fab-size', fabSize.toString())",
  "toast('Size: ' + fabSize + 'px')",
  'function changeFabStyle()',
  "bg: 'linear-gradient(135deg,#FF2D7A,#833AB4)'",
  "bg: 'rgba(10,10,10,0.8)'",
  "bg: 'rgba(255,255,255,0.08)'",
  'fabStyle = (fabStyle + 1) % styles.length',
  "localStorage.setItem('nova-fab-style', fabStyle.toString())",
  "toast('Style Changed')",
  'closeFabLongPressMenu()'
]) {
  assert(source.includes(marker), `FAB customization marker missing: ${marker}`);
}
assert.strictEqual((source.match(/const (sizes|styles) =/g) || []).length, 2, 'FAB customization must define size and style presets');
assert.strictEqual((source.match(/localStorage\.setItem\(/g) || []).length, 2, 'FAB customization must persist size and style once each');
assert.strictEqual((source.match(/closeFabLongPressMenu\(\)/g) || []).length, 2, 'FAB customization must close the menu after each action');
assert(source.includes("fab.style.width = fabSize + 'px'"), 'FAB size must apply width');
assert(source.includes("fab.style.height = fabSize + 'px'"), 'FAB size must apply height');
assert(source.includes("fab.style.backdropFilter = 'blur(16px)'"), 'FAB style index 1 must apply blur');
assert(source.includes("fab.style.backdropFilter = 'none'"), 'Other FAB styles must clear blur');
assert(!source.includes('fetch('), 'FAB customization must not own network requests');
assert(!source.includes('supabase'), 'FAB customization must not own remote persistence');

console.log('FAB_CUSTOMIZATION_CONTRACT_HARNESS=PASS');
console.log('SIZE_STYLE_CYCLES_DOM_ASSIGNMENTS_STORAGE_TOAST_MENU_CLOSE_BLUR_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/fab-customization.js');
console.log('PRODUCTION_CHANGE=0');
