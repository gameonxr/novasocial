'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const docs = path.join(repo, 'docs');
const featureDir = path.join(repo, 'src', 'features');
const owners = fs.readFileSync(path.join(featureDir, 'story-editor-owners.js'), 'utf8');

assert(!html.includes('function renderStoryElements()'), 'Story editor renderer must be absent from inline HTML after split');
assert(owners.includes('window.renderStoryElements = function(){'), 'Story editor renderer must have one anonymous window owner');
assert(html.includes('let storyEditorElements = [];'), 'Story editor element state must remain inline');
const showCreateStoryModule = fs.readFileSync(path.join(featureDir, 'show-create-story.js'), 'utf8');
assert((html + '\n' + showCreateStoryModule).includes('id="se-elements"'), 'Story editor elements container must remain present');
const showDeleteZoneModule = fs.readFileSync(path.join(featureDir, 'show-delete-zone.js'), 'utf8');
assert((html + '\n' + showDeleteZoneModule).includes('function showDeleteZone()') && html.includes('function hideDeleteZone()'), 'delete-zone helpers must remain protected');
const rendererSurface = html + '\n' + owners;
assert(rendererSurface.includes('storyEditorElements = storyEditorElements.filter'), 'delete-zone removal must remain in the renderer surface');
assert(rendererSurface.includes('el.x = Math.max(5, Math.min(95') && rendererSurface.includes('el.y = Math.max(5, Math.min(95'), 'drag position updates and 5–95 bounds must remain in the renderer surface');
assert(rendererSurface.includes('ondblclick'), 'text double-tap boundary must remain present');
const publishStoryEditorModule = fs.readFileSync(path.join(featureDir, 'publish-story-editor.js'), 'utf8');
assert((html + '\n' + publishStoryEditorModule).includes('function publishStoryEditor()'), 'publishing boundary must remain separate');
assert(fs.existsSync(path.join(docs, 'story-editor-contract.md')), 'Story editor behavior contract must exist');
assert(fs.existsSync(path.join(docs, 'story-editor-contract-harness.js')), 'Story editor behavior harness must exist');
assert(html.includes('src/features/story-editor-owners.js'), 'Story editor owner script must be loaded');
assert((owners.match(/window\.renderStoryElements\s*=\s*function\(\)\{/g) || []).length === 1, 'Story editor owner must be assigned exactly once');

console.log('STORY_EDITOR_SPLIT_SEAM_HARNESS=PASS');
console.log('RENDERER_OWNER=src/features/story-editor-owners.js');
console.log('PERSISTENCE_OWNER=INLINE_PUBLISH_STORY_EDITOR');
console.log('PRODUCTION_SPLIT=1');
console.log('BROWSER_SIDE_EFFECTS=0');
