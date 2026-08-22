'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const docs = path.join(repo, 'docs');
const featureDir = path.join(repo, 'src', 'features');

assert(html.includes('function renderStoryElements()'), 'protected Story editor renderer must remain inline');
assert(html.includes('let storyEditorElements = [];'), 'Story editor element state must remain inline');
assert(html.includes('id="se-elements"'), 'Story editor elements container must remain present');
assert(html.includes('function showDeleteZone()') && html.includes('function hideDeleteZone()'), 'delete-zone helpers must remain protected');
assert(html.includes('storyEditorElements = storyEditorElements.filter'), 'delete-zone removal must remain inline');
assert(html.includes('el.x = Math.max(5, Math.min(95') && html.includes('el.y = Math.max(5, Math.min(95'), 'drag position updates and 5–95 bounds must remain inline');
assert(html.includes('dblclick') || html.includes('detail === 2'), 'text double-tap boundary must remain present');
assert(html.includes('function publishStoryEditor()'), 'publishing boundary must remain separate');
assert(fs.existsSync(path.join(docs, 'story-editor-contract.md')), 'Story editor behavior contract must exist');
assert(fs.existsSync(path.join(docs, 'story-editor-contract-harness.js')), 'Story editor behavior harness must exist');
assert(!fs.existsSync(path.join(featureDir, 'story-editor-owners.js')), 'Story editor production module must not exist during preparation');

console.log('STORY_EDITOR_SEAM_PREPARATION_HARNESS=PASS');
console.log('RENDERER_OWNER=INLINE');
console.log('PERSISTENCE_OWNER=INLINE_PUBLISH_STORY_EDITOR');
console.log('PRODUCTION_SPLIT=0');
console.log('BROWSER_SIDE_EFFECTS=0');
