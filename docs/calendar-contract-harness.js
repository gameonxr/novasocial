const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'calendar.js'), 'utf8');

for (const marker of [
  'function showCalendar()',
  "modal('📅 Calendar')",
  "m.querySelector('#mbody')",
  'const today = new Date()',
  'today.getMonth()',
  'today.getFullYear()',
  'new Date(year, month, 1).getDay()',
  'new Date(year, month + 1, 0).getDate()',
  'for(let i = 0; i < firstDay; i++)',
  'for(let d = 1; d <= daysInMonth; d++)',
  'const isToday = d === today.getDate()',
  "['S','M','T','W','T','F','S']",
  'UPCOMING EVENTS',
  'Team Meeting',
  'Flutter Workshop',
  'Gaming Tournament',
  "toast('Reminder set!')",
  'addCalendarEvent()'
]) {
  assert(source.includes(marker), `Calendar marker missing: ${marker}`);
}
assert.strictEqual((source.match(/<button /g) || []).length, 4, 'Calendar must retain two navigation, one repeated reminder template, and one add-event button');
assert.strictEqual((source.match(/toast\(/g) || []).length, 2, 'Calendar must retain date and reminder toast actions');
assert(source.includes("${isToday?'background:linear-gradient(135deg,#833AB4,#E1306C);color:#fff;font-weight:700':'color:#ccc'}"), 'Calendar must preserve today highlighting');
assert(!source.includes('supabase'), 'Calendar display must not own persistence');
assert(!source.includes('fetch('), 'Calendar display must not own network requests');
assert(source.includes('addCalendarEvent()'), 'Calendar must preserve the intentional inline Notes-boundary event seam');

console.log('CALENDAR_CONTRACT_HARNESS=PASS');
console.log('MODAL_CURRENT_MONTH_GRID_TODAY_HIGHLIGHT_EVENTS_TOASTS_INLINE_EVENT_SEAM=LOCKED');
console.log('MODULE_OWNER=src/features/calendar.js');
console.log('PRODUCTION_CHANGE=0');
