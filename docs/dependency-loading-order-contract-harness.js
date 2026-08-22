const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const scripts = [];
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
  const attrs = match[1];
  const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  scripts.push({ src: srcMatch ? srcMatch[1] : null, attrs, inline: !srcMatch });
}
const styles = [...html.matchAll(/<link\b([^>]*\brel\s*=\s*["']stylesheet["'][^>]*)>/gi)].map(match => match[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]).filter(Boolean);
const localScripts = scripts.filter(item => item.src && item.src.startsWith('src/'));
const indexOf = (needle) => scripts.findIndex(item => item.src === needle);
const externalIndex = scripts.findIndex(item => item.src === 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
const firstLocalScriptIndex = scripts.findIndex(item => item.src && item.src.startsWith('src/'));
const inlineIndexes = scripts.map((item, i) => item.inline ? i : -1).filter(i => i >= 0);
const appInlineIndex = inlineIndexes[0];

assert.strictEqual(externalIndex, 0, 'Supabase CDN must be the first script');
assert.strictEqual(styles.length, 18, 'exactly 18 local stylesheets must be linked');
assert(styles.every(href => href.startsWith('src/styles/')), 'all stylesheet links must target src/styles');
assert(styles.every(href => html.indexOf(`href="${href}"`) < html.indexOf('<script src="src/')), 'all local stylesheets must precede local application scripts');
assert(firstLocalScriptIndex > externalIndex, 'local scripts must follow the CDN dependency');
assert(localScripts.slice(0, 9).every(item => item.src.startsWith('src/core/')), 'core scripts must load first');
assert(localScripts.slice(9, 11).every(item => item.src.startsWith('src/components/')), 'components must follow core scripts');
assert(localScripts.slice(11).some(item => item.src.startsWith('src/features/')), 'features must follow shared components');
assert(appInlineIndex > 0, 'inline application script must exist after extracted scripts');
const trailing = scripts.slice(-6).map(item => item.src);
assert.deepStrictEqual(trailing, ['src/features/spawn-like-particles.js', 'src/features/sync-local-deletion-fallback.js', 'src/features/push-settings.js', 'src/features/note-viewer-owners.js', 'src/features/story-editor-owners.js', 'src/features/like-effects.js'], 'final six scripts must preserve required order after seven approved protected owners');
for (const item of scripts) {
  if (item.src && item.src.startsWith('src/')) assert(!/\btype\s*=|\bdefer\b|\basync\b/i.test(item.attrs), `local script must remain classic: ${item.src}`);
}

console.log('DEPENDENCY_LOADING_ORDER_HARNESS=PASS');
console.log(`SCRIPTS=${scripts.length}`);
console.log(`STYLESHEETS=${styles.length}`);
console.log(`TRAILING=${trailing.join(',')}`);
