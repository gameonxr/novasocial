'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'smart-replies.js'), 'utf8');
const start = source.indexOf('function getSmartReplies');
const end = source.indexOf('\n}\n\nfunction showSmartReplies', start);
assert(start >= 0 && end > start, 'getSmartReplies owner must remain identifiable');
const owner = source.slice(start, end + 2);

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /document\.|sendMsg\(|quickSendReply\(|showSmartReplies\(/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|location\.|history\./i,
  /\b(?:ME|PROF)\s*(?:\?\.|\.|\[)|\b(?:auth|upload|permission|Notification|PushManager)\b/i,
]) {
  assert(!forbidden.test(owner), `getSmartReplies must remain pure: ${forbidden}`);
}

const context = {};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'smart-replies.js' });
assert.strictEqual(typeof context.getSmartReplies, 'function', 'getSmartReplies must remain globally callable');

function assertList(actual, expected, message) {
  assert.strictEqual(JSON.stringify(actual), JSON.stringify(expected), message);
}

const greeting = context.getSmartReplies('HELLO there');
const status = context.getSmartReplies('Kaise Ho, dost?');
const thanks = context.getSmartReplies('SHUKRIYA for helping');
const goodbye = context.getSmartReplies('See You later');
const question = context.getSmartReplies('Will you join me?');
const affection = context.getSmartReplies('Mujhe pyar chahiye');
const food = context.getSmartReplies('Lunch karoge');
const precedence = context.getSmartReplies('Hello, kaise ho?');
const fallback = context.getSmartReplies('A completely unrelated sentence');
const empty = context.getSmartReplies(null);

assertList(greeting, ['Hey! 😄', 'Hi there! 👋', 'Hello! Kaise ho?'], 'greeting rule must be case-insensitive and preserve suggestions');
assertList(status, ['Mast hu, tu bata? 😄', 'All good! Tera kya haal?', 'Ekdum fit fat! 💪'], 'status rule must preserve suggestions');
assertList(thanks, ['Koi baat nahi! 😊', 'Anytime! 🤝', 'My pleasure! ✨'], 'thanks rule must preserve suggestions');
assertList(goodbye, ['Bye! 👋', 'Milte hain phir! 🤝', 'Take care! ❤️'], 'goodbye rule must preserve suggestions');
assertList(question, ['Hmm, sochta hu 🤔', 'Pata nahi yaar 😅', 'Haan bilkul! ✨'], 'question rule must preserve suggestions');
assertList(affection, ['Awww 🥰', 'Same here ❤️', '💕💕'], 'affection rule must preserve suggestions');
assertList(food, ['Bhookh lagi! 🍕', 'Kha lenge kahin?', 'Yum! 😋'], 'food rule must preserve suggestions');
assertList(precedence, greeting, 'first matching greeting rule must take precedence over later status/question rules');
assertList(fallback, ['Interesting! 🤔', 'Tell me more 👀', 'Haha 😄', 'Sounds good! 👍', 'Hmm 🤔'], 'unknown input must use the fallback list');
assertList(empty, fallback, 'missing input must use the fallback list');

console.log('SMART_REPLIES_CONTRACT_HARNESS=PASS');
console.log('CASE_INSENSITIVE_RULES=PASS');
console.log('FIRST_MATCH_PRECEDENCE=PASS');
console.log('FALLBACK_AND_MISSING_INPUT=PASS');
console.log('PURE_CLASSIFIER_SIDE_EFFECTS=0');
console.log('PROTECTED_CHAT_SENDER=EXCLUDED');
console.log('PRODUCTION_CHANGE=0');
