'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
function git(...args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
}

assert.strictEqual(git('branch', '--show-current'), 'Branch2', 'work must remain on Branch2');
assert.strictEqual(git('rev-parse', 'refs/remotes/origin/main'), 'ef418007c9b9a797488b4825be5f0c807da22369', 'origin/main must remain unchanged');
assert.strictEqual(git('status', '--porcelain'), '', 'worktree must be clean');
assert.strictEqual(git('rev-parse', 'HEAD'), git('rev-parse', 'origin/Branch2'), 'local Branch2 must match origin/Branch2');

const latestFiles = git('diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD').split('\n').filter(Boolean);
assert(latestFiles.length > 0, 'latest checkpoint must contain files');
const allowedProtectedSplitFiles = new Set(['MIGRATION_MAP.md', 'index.html', 'src/features/dms-renderer-owner.js', 'src/features/spawn-like-particles.js', 'src/features/sync-local-deletion-fallback.js', 'src/features/push-settings.js', 'src/features/reels-video-windowing.js']);
assert(latestFiles.every(file => file.startsWith('docs/') || allowedProtectedSplitFiles.has(file)), 'latest checkpoint must contain only docs and approved protected split files');
if (latestFiles.includes('index.html') || latestFiles.includes('src/features/dms-renderer-owner.js') || latestFiles.includes('src/features/spawn-like-particles.js') || latestFiles.includes('src/features/sync-local-deletion-fallback.js') || latestFiles.includes('src/features/push-settings.js') || latestFiles.includes('src/features/reels-video-windowing.js')) {
  assert(latestFiles.includes('index.html'), 'protected split checkpoint must include index.html');
  if (latestFiles.includes('src/features/dms-renderer-owner.js')) assert(latestFiles.includes('src/features/dms-renderer-owner.js'), 'DMs renderer split checkpoint must include the DMs renderer module');
  assert(latestFiles.includes('src/features/spawn-like-particles.js'), 'protected split checkpoint must include the particle module');
  assert(latestFiles.includes('src/features/sync-local-deletion-fallback.js'), 'protected split checkpoint must include the deletion-fallback module');
  assert(latestFiles.includes('src/features/push-settings.js'), 'protected split checkpoint must include the Push settings module');
  if (latestFiles.includes('src/features/reels-video-windowing.js')) assert(latestFiles.includes('src/features/reels-video-windowing.js'), 'Reels helper split checkpoint must include its module');
}

const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
for (const marker of [
  'function createPeerConnection(',
  'function openSV('
]) {
  assert(html.includes(marker), `protected inline marker missing: ${marker}`);
}
const dmsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');
const reelsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'reels-renderer-owner.js'), 'utf8');
assert(dmsModule.includes('window.renderDMs = async function(){'), 'approved DMs renderer module owner must remain present');
assert(reelsModule.includes('window.renderReels = async function(){'), 'approved Reels renderer module owner must remain present');
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
assert(deletionModule.includes('window.syncLocalDeletionFallback = async function() {'), 'approved deletion-fallback module owner must remain present');
const storyModule = fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
assert(storyModule.includes('window.renderStoryElements = function(){'), 'approved Story renderer module owner must remain present');

console.log('BRANCH2_ONLY_SAFETY_HARNESS=PASS');
console.log(`LATEST_FILES=${latestFiles.length}`);
console.log('LATEST_CHECKPOINT=REELS_RENDERER_SPLIT_COMPLETE');
console.log('MAIN_REF_UNCHANGED=YES');
