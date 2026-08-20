const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const utils = fs.readFileSync(path.join(repo, 'src', 'core', 'utils.js'), 'utf8');
assert.strictEqual((utils.match(/function isOnline\(/g) || []).length, 1, 'isOnline must have exactly one shared definition');
assert.strictEqual((utils.match(/function lastSeenText\(/g) || []).length, 1, 'lastSeenText must have exactly one shared definition');
const start = utils.indexOf('function isOnline(');
const end = utils.indexOf('\nlet toastT', start);
assert(start >= 0 && end > start, 'presence helper boundary must remain extractable');
const helpers = utils.slice(start, end);
assert(helpers.includes("if(!ts)return false;"), 'isOnline must reject missing timestamps');
assert(helpers.includes('<5*60*1000'), 'isOnline must retain the five-minute threshold');
assert(helpers.includes("if(!ts) return '';"), 'lastSeenText must return empty string for missing timestamps');
assert(helpers.includes("if(diff < 60) return 'Active now';"), 'recent presence label must remain Active now');
assert(helpers.includes("if(diff < 3600) return `Last seen ${Math.floor(diff/60)}m ago`;"), 'minute presence label must remain stable');
assert(helpers.includes("if(diff < 86400) return `Last seen ${Math.floor(diff/3600)}h ago`;"), 'hour presence label must remain stable');
assert(helpers.includes("return `Last seen ${Math.floor(diff/86400)}d ago`;"), 'day presence label must remain stable');

console.log('PRESENCE_FORMATTING_HARNESS=PASS');
console.log('SHARED_IS_ONLINE_DEFINITION=1');
console.log('SHARED_LAST_SEEN_DEFINITION=1');
console.log('ONLINE_THRESHOLD_MINUTES=5');
console.log('LAST_SEEN_BUCKETS=NOW_MINUTES_HOURS_DAYS');
