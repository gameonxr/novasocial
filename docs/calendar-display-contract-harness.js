const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'calendar.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function showCalendar()',
  "modal('📅 Calendar')",
  "const today = new Date()",
  'const month = today.getMonth()',
  'const year = today.getFullYear()',
  'const firstDay = new Date(year, month, 1).getDay()',
  'const daysInMonth = new Date(year, month + 1, 0).getDate()',
  "for(let i = 0; i < firstDay; i++)",
  'for(let d = 1; d <= daysInMonth; d++)',
  'const isToday = d === today.getDate()',
  "toast('📅 ${d} ${monthNames[month]} ${year}')",
  'UPCOMING EVENTS',
  "toast('Reminder set!')",
  'addCalendarEvent()'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Calendar marker missing: ${marker}`);
}
assert(html.includes('src/features/calendar.js'), 'Calendar module must remain linked from HTML');
assert(!source.includes('db.from('), 'Calendar display module must not own database writes');
assert(!source.includes("go('"), 'Calendar display module must not own navigation');
assert.strictEqual((source.match(/function showCalendar\(/g) || []).length, 1, 'Calendar renderer must have one module owner');

console.log('CALENDAR_DISPLAY_CONTRACT_HARNESS=PASS');
console.log('DATE_GRID_TODAY_EVENTS_REMINDERS_ADD_EVENT=LOCKED');
console.log('MODULE_OWNER=src/features/calendar.js');
console.log('PRODUCTION_CHANGE=0');
