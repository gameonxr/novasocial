const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const comments = fs.readFileSync(path.join(repo, 'src', 'features', 'comments.js'), 'utf8');
const moderation = fs.readFileSync(path.join(repo, 'src', 'features', 'ai-moderation.js'), 'utf8');

function functionBlock(source, signature) {
  const start = source.indexOf(signature);
  assert(start >= 0, `function signature missing: ${signature}`);
  const next = source.slice(start + signature.length).search(/\n(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/);
  return source.slice(start, next < 0 ? source.length : start + signature.length + next);
}

const critical = [
  { source: comments, signature: 'async function sendCmt(pid)', table: "db.from('comments').insert", label: 'sendCmt' },
  { source: html, signature: 'async function submitCreate(type)', table: "db.from('posts').insert", label: 'submitCreate' },
  { source: html, signature: 'async function sendMsg(cid)', table: "db.from('messages').insert", label: 'sendMsg' },
  { source: fs.readFileSync(path.join(repo, 'src', 'features', 'block-user.js'), 'utf8'), signature: 'async function blockUser(userId, btn)', table: "db.from('blocks').insert", label: 'blockUser' },
  { source: fs.readFileSync(path.join(repo, 'src', 'features', 'unblock-user.js'), 'utf8'), signature: 'async function unblockUser(userId, btn)', table: "db.from('blocks').delete", label: 'unblockUser' },
];

for (const item of critical) {
  const body = functionBlock(item.source, item.signature);
  assert(body.includes(item.table), `${item.label} must retain its primary mutation table`);
  assert(body.includes('.throwOnError()'), `${item.label} must retain .throwOnError()`);
}

assert(html.includes('src/features/comments.js'), 'comments module must remain loaded by index.html');
assert(moderation.includes('window.sendCmt'), 'AI moderation wrapper must retain the sendCmt global seam');
assert(comments.includes("if(e.message?.includes('RATE_LIMIT_EXCEEDED'))"), 'sendCmt must retain rate-limit-specific error handling');
assert(comments.includes("return; // Don't proceed to notifications/refresh if insert failed"), 'sendCmt must stop after a failed insert');

console.log('MUTATION_ERROR_BOUNDARY_HARNESS=PASS');
console.log('CRITICAL_MUTATIONS=5');
console.log('THROW_ON_ERROR_BOUNDARIES=5');
console.log('RATE_LIMIT_HANDLING=PASS');
console.log('FAILED_INSERT_EARLY_RETURN=PASS');
