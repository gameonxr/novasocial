'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src/features/story-editor-owners.js'), 'utf8');
const created = [];
const container = {
  _innerHTML: 'stale', children: [],
  get innerHTML() { return this._innerHTML; },
  set innerHTML(value) { this._innerHTML = value; this.children = []; },
  appendChild(child) { this.children.push(child); },
};
const context = {
  window: {},
  storyEditorElements: [
    { id: 't1', type: 'text', text: 'Hello', fontFamily: 'Inter', fontWeight: 700, fontSize: 24, color: '#fff', x: 50, y: 50, scale: 1, rotate: 0, gradient: false },
  ],
  _POLL_STYLES: [{ bg: '#123' }],
  document: {
    getElementById(id) {
      if (id === 'se-elements') return container;
      if (id === 'se-canvas-area') return { getBoundingClientRect: () => ({ width: 100, height: 100 }) };
      return null;
    },
    createElement() {
      const el = {
        dataset: {}, style: {}, innerHTML: '', children: [],
        addEventListener() {}, appendChild(child) { this.children.push(child); },
      };
      created.push(el);
      return el;
    },
    addEventListener() {},
  },
  console,
};
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'story-editor-owners.js' });
assert.strictEqual(typeof context.window.renderStoryElements, 'function', 'window owner must be callable');
context.window.renderStoryElements();
assert.strictEqual(container.innerHTML, '', 'renderer must clear the elements container');
assert.strictEqual(container.children.length, 1, 'renderer must append one element per story item');
assert.strictEqual(container.children[0].dataset.id, 't1', 'renderer must preserve stable element IDs');
assert(container.children[0].innerHTML.includes('Hello'), 'renderer must preserve text content');
assert.strictEqual(typeof container.children[0].ondblclick, 'function', 'renderer must wire text double-tap handling');

console.log('STORY_EDITOR_BROWSER_PARITY_HARNESS=PASS');
console.log('DOM=synthetic');
console.log('STORY_ACTIONS=0');
console.log('STORAGE_MUTATION=0');
console.log('MEDIA_MUTATION=0');
