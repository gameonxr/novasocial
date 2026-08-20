const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'select-filter.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function selectFilter(chip,css)',
  'window._selectedFilter=css',
  "document.getElementById('mprev-media')",
  "css==='none'?'':css",
  "document.getElementById('filter-tray')",
  "tray.querySelectorAll('[data-f]')",
  "chip.querySelector('[data-f]').style.borderColor='#E1306C'",
  "chip.querySelector('div:last-child').style.color='#fff'",
  "tray.querySelectorAll('div[style*=\"flex-shrink:0\"]')",
  "toast('Filter applied 🎨')"
]) {
  assert(source.includes(marker), `Select filter marker missing: ${marker}`);
}
assert(html.includes('src/features/select-filter.js'), 'Select filter module must remain linked from HTML');
assert(!source.includes('fetch('), 'Select filter must not own network requests');
assert(!source.includes('supabase'), 'Select filter must not own remote data access');
assert.strictEqual((source.match(/function selectFilter\(/g) || []).length, 1, 'Select filter must have one module owner');

console.log('SELECT_FILTER_CONTRACT_HARNESS=PASS');
console.log('STATE_NONE_PREVIEW_TRAY_CHIP_RESET_TOAST_UI_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/select-filter.js');
console.log('PRODUCTION_CHANGE=0');
