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
assert(latestFiles.every(file => file === 'MIGRATION_MAP.md' || file.startsWith('docs/')), 'latest checkpoint must be documentation-only');

const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
for (const marker of [
  'function renderDMs(',
  'function renderReels(',
  'function createPeerConnection(',
  'function openSV(',
  'function spawnLikeParticles(',
  'function renderStoryElements(',
  'async function syncLocalDeletionFallback('
]) {
  assert(html.includes(marker), `protected marker missing: ${marker}`);
}

console.log('BRANCH2_ONLY_SAFETY_HARNESS=PASS');
console.log(`LATEST_FILES=${latestFiles.length}`);
console.log('LATEST_CHECKPOINT=DOCS_ONLY');
console.log('MAIN_REF_UNCHANGED=YES');
