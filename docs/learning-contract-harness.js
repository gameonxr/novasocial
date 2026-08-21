const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'learning.js'), 'utf8');

for (const marker of [
  'function showLearning()',
  "modal('🎓 Learning')",
  "m.querySelector('#mbody')",
  'Learning Hub',
  'Continue Learning',
  'Flutter Basics',
  'Python Mastery',
  'UI/UX Design',
  'Digital Marketing',
  'AI & ML Basics',
  'Content Creation',
  'lessons:',
  'progress:',
  "startCourse('${c.title}')",
  'c.progress > 0',
  'function startCourse(title)',
  'closeModal()'
]) {
  assert(source.includes(marker), `Learning marker missing: ${marker}`);
}
assert.strictEqual((source.match(/title:'/g) || []).length, 6, 'Learning must retain six course fixtures');
assert.strictEqual((source.match(/startCourse\('/g) || []).length, 1, 'Learning must use one course-card routing template');
assert.strictEqual((source.match(/lessons:/g) || []).length, 6, 'Learning must retain lesson metadata for six courses');
assert.strictEqual((source.match(/progress:/g) || []).length, 6, 'Learning must retain progress metadata for six courses');
assert(source.includes('toast(`🎓 Starting "${title}"... Lesson 1 loading!`)'), 'Learning must preserve start-course feedback');
assert(!source.includes('fetch('), 'Learning must not own network requests');
assert(!source.includes('supabase'), 'Learning must not own persistence');

console.log('LEARNING_CONTRACT_HARNESS=PASS');
console.log('MODAL_HUB_SIX_COURSES_METADATA_PROGRESS_ROUTING_TOAST_CLOSE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/learning.js');
console.log('PRODUCTION_CHANGE=0');
