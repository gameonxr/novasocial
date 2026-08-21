const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'ai-journal.js'), 'utf8');

for (const marker of [
  'function showAIJournal()',
  "document.getElementById('screen')",
  "toLocaleDateString('en-IN'",
  'AI Daily Summary',
  'Posts Viewed',
  'Likes Given',
  'DMs Sent',
  'MOOD TODAY',
  'RECENT ENTRIES',
  'Productive Day',
  'Gaming Marathon',
  'Chill Sunday',
  'function showAIJournalEntry()',
  "modal('✏️ New Journal Entry')",
  'id="journal-title"',
  'id="journal-content"',
  "['😊 Happy','😢 Sad','💪 Motivated','😴 Tired','🤩 Excited','😌 Calm','🎨 Creative','🔥 Energetic']",
  'saveJournalEntry()',
  'generateAIJournal()',
  'function saveJournalEntry()',
  '!title?.trim() || !content?.trim()',
  "toast('Title aur content dono chahiye')",
  "localStorage.getItem('nova-journal') || '[]'",
  'entries.unshift({title, content, mood: window._journalMood || \'😊 Happy\', date: new Date().toISOString()})',
  "localStorage.setItem('nova-journal', JSON.stringify(entries))",
  "toast('📔 Entry saved!')",
  'closeModal()',
  'function generateAIJournal()',
  'content.value = "Aaj ka din bahut productive raha.',
  "toast('🤖 AI ne entry generate kar di!')"
]) {
  assert(source.includes(marker), `AI journal marker missing: ${marker}`);
}
assert.strictEqual((source.match(/title:'/g) || []).length, 3, 'AI journal must retain three recent-entry fixtures');
assert.strictEqual((source.match(/mood-chip/g) || []).length, 2, 'AI journal must retain mood-chip class in template and reset handler');
assert.strictEqual((source.match(/localStorage\./g) || []).length, 2, 'AI journal must read and write local storage once each');
assert.strictEqual((source.match(/toast\(/g) || []).length, 3, 'AI journal must retain validation, save, and generation feedback');
assert(!source.includes('fetch('), 'AI journal must not own network requests');
assert(!source.includes('invokeLLM'), 'AI journal must remain deterministic and service-free');
assert(!source.includes('supabase'), 'AI journal must remain local-only');
assert(!source.includes('sendMessage'), 'AI journal must not own protected messaging');

console.log('AI_JOURNAL_CONTRACT_HARNESS=PASS');
console.log('SCREEN_MODAL_SUMMARY_FIXTURES_MOODS_VALIDATION_LOCAL_STORAGE_SAVE_GENERATION_LOCAL_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/ai-journal.js');
console.log('PRODUCTION_CHANGE=0');
