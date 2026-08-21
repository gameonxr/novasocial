const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'filter-tray.js'), 'utf8');

for (const marker of [
  'function showFilterTray(mediaUrl)',
  "document.getElementById('filter-tray')",
  "if(!tray){return;}",
  "tray.innerHTML=''",
  "tray.style.display='flex'",
  "tray.style.padding='10px 0'",
  "tray.style.gap='12px'",
  "const allFilters = [...FILTERS, ...AI_FILTERS]",
  'allFilters.forEach((flt,idx)=>',
  "document.createElement('div')",
  'data-f="${flt.css}"',
  'idx===0?\'#E1306C\':\'#222\'',
  'mediaUrl?`<img src="${mediaUrl}"',
  '🎨</div>',
  "onerror=\"this.style.display='none'\"",
  'chip.onclick=function(){selectFilter(this,flt.css);}',
  'tray.appendChild(chip)'
]) {
  assert(source.includes(marker), `Filter tray marker missing: ${marker}`);
}
assert.strictEqual((source.match(/document\.createElement\('div'\)/g) || []).length, 1, 'Filter tray must use one chip creation template');
assert.strictEqual((source.match(/selectFilter\(this,flt\.css\)/g) || []).length, 1, 'Filter tray must delegate selection once per chip template');
assert(source.includes('const allFilters = [...FILTERS, ...AI_FILTERS]'), 'Filter tray must combine the base and AI filter sources');
assert(!source.includes('fetch('), 'Filter tray must not own network requests');
assert(!source.includes('supabase'), 'Filter tray must not own persistence');

console.log('FILTER_TRAY_CONTRACT_HARNESS=PASS');
console.log('GUARD_STYLING_COMBINED_SOURCES_CHIPS_MEDIA_FALLBACK_INITIAL_SELECTION_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/filter-tray.js');
console.log('PRODUCTION_CHANGE=0');
