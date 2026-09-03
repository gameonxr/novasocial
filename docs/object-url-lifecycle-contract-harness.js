const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const files = [path.join(repo, 'index.html'), ...execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const index = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const postActions = fs.readFileSync(path.join(repo, 'src', 'features', 'post-actions.js'), 'utf8');
const compressImage = fs.readFileSync(path.join(repo, 'src', 'features', 'compress-image.js'), 'utf8');
const compressVideo = fs.readFileSync(path.join(repo, 'src', 'features', 'compress-video.js'), 'utf8');
const prevMedia = fs.readFileSync(path.join(repo, 'src', 'features', 'prev-media.js'), 'utf8');
const storyText = fs.readFileSync(path.join(repo, 'src', 'features', 'story-text-helpers.js'), 'utf8');

assert.strictEqual(files.length, 396, 'index.html plus 240 extracted modules must be audited after the DMs renderer split');
assert.strictEqual((source.match(/URL\.createObjectURL\(/g) || []).length, 14, '14 object-URL creation calls must remain');
assert.strictEqual((source.match(/URL\.revokeObjectURL\(/g) || []).length, 8, '8 object-URL revocation calls must remain');
assert(index.includes('async function downloadStory(storyId)'), 'Story download helper must remain present');
assert(index.includes('URL.revokeObjectURL(link.href)'), 'Story download must retain object-URL cleanup');
assert(postActions.includes('async function downloadMedia'), 'post-media download helper must remain present');
assert(postActions.includes('URL.revokeObjectURL(link.href)'), 'post-media download must retain object-URL cleanup');
assert(compressImage.includes('URL.revokeObjectURL(url)'), 'image compression must retain object-URL cleanup');
assert(compressVideo.includes('URL.revokeObjectURL(url)'), 'video compression must retain object-URL cleanup');
assert(prevMedia.includes('URL.createObjectURL(f)'), 'post preview object-URL ownership must remain present');
assert(storyText.includes('URL.createObjectURL(f)'), 'Story preview object-URL ownership must remain present');

console.log('OBJECT_URL_LIFECYCLE_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log('CREATE_OBJECT_URL_CALLS=14');
console.log('REVOKE_OBJECT_URL_CALLS=8');
console.log('DOWNLOAD_CLEANUP=PASS');
console.log('COMPRESSION_CLEANUP=PASS');
console.log('PREVIEW_OWNERSHIP=PASS');
