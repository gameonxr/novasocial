'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src/features/note-deletion-owner.js'), 'utf8');

async function runScenario({ deleteFails = false, artwork = 'https://res.cloudinary.com/demo/image/upload/note.jpg' } = {}) {
  const events = [];
  const context = {
    window: {},
    _myActiveNote: { id: 'note-test-1', music_artwork: artwork },
    db: {
      from(table) {
        events.push(`from:${table}`);
        return {
          delete() {
            events.push('delete');
            return {
              eq(column, value) {
                events.push(`eq:${column}:${value}`);
                return deleteFails ? Promise.reject(new Error('synthetic delete failure')) : Promise.resolve({ error: null });
              },
            };
          },
        };
      },
    },
    deleteMediaProduction: async (...args) => {
      events.push(`media:${args.join('|')}`);
    },
    toast: (message) => events.push(`toast:${message}`),
    closeModal: () => events.push('closeModal'),
    loadNotesBar: () => events.push('loadNotesBar'),
    console: { error: () => events.push('console.error') },
  };
  context.window.document = {};
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'note-deletion-owner.js' });
  assert.strictEqual(typeof context.window.deleteMyNote, 'function', 'window owner must be callable');
  await context.window.deleteMyNote();
  return events;
}

(async () => {
  const success = await runScenario();
  assert.deepStrictEqual(success, [
    'from:quick_notes',
    'delete',
    'eq:id:note-test-1',
    'media:https://res.cloudinary.com/demo/image/upload/note.jpg|note|user_delete',
    'toast:Note removed',
    'closeModal',
    'loadNotesBar',
  ], 'success path must preserve delete, cleanup, feedback, close, and reload order');

  const failure = await runScenario({ deleteFails: true, artwork: null });
  assert.deepStrictEqual(failure, [
    'from:quick_notes',
    'delete',
    'eq:id:note-test-1',
    'console.error',
    'toast:❌ Note delete failed',
    'closeModal',
    'loadNotesBar',
  ], 'failure path must preserve failure feedback, close, and reload');

  console.log('NOTE_DELETION_BROWSER_PARITY_HARNESS=PASS');
  console.log('DOM=synthetic');
  console.log('DATABASE_MUTATION=mocked_only');
  console.log('MEDIA_MUTATION=mocked_only');
  console.log('SUCCESS_ORDER=DELETE_CLEANUP_FEEDBACK_CLOSE_RELOAD');
  console.log('FAILURE_ORDER=FEEDBACK_CLOSE_RELOAD');
})();
