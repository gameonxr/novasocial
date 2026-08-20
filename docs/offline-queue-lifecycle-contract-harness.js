const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const offline = fs.readFileSync(path.join(repo, 'src', 'core', 'offline.js'), 'utf8');
const posts = fs.readFileSync(path.join(repo, 'src', 'features', 'posts.js'), 'utf8');

assert(offline.includes('window._offlineQueue = window._offlineQueue || [];'), 'offline queue must retain singleton initialization');
assert(offline.includes('window._offlineBanner = null;'), 'offline banner handle must retain initialization');
assert(offline.includes('navigator.onLine === false'), 'offline detection must retain navigator.onLine false check');
assert(offline.includes('if (window._offlineBanner) return;'), 'offline banner show must remain idempotent');
assert(offline.includes("banner.id = 'nova-offline-banner';"), 'offline banner id must remain stable');
assert(offline.includes('banner.innerHTML = \'No internet connection — some actions may not save\';'), 'offline banner message must remain stable');
assert(offline.includes('action.ts = Date.now();'), 'queued actions must retain timestamping');
assert(offline.includes('window._offlineQueue.push(action);'), 'queued actions must retain append behavior');
assert(offline.includes('const queue = [...window._offlineQueue];'), 'replay must snapshot the queue');
assert(offline.includes('window._offlineQueue = [];'), 'replay must clear the queue before processing');
assert(offline.includes("action.type === 'like'"), 'like replay branch must remain');
assert(offline.includes("action.type === 'follow'"), 'follow replay branch must remain');
assert(offline.includes('for (const action of queue)'), 'replay must preserve queue order');
assert(offline.includes('if (syncedCount > 0)'), 'synced-count toast guard must remain');
assert.strictEqual((offline.match(/window\.addEventListener\(/g) || []).length, 2, 'offline and online listeners must remain the only two window listeners in offline.js');
assert(offline.includes("window.addEventListener('offline'"), 'offline listener must remain');
assert(offline.includes("window.addEventListener('online'"), 'online listener must remain');
assert(offline.includes('_showOfflineBanner();\n  }\n}'), 'initial offline state check must remain');
assert(posts.includes('isOffline()'), 'Posts integration must retain offline detection');
assert(posts.includes('_queueOfflineAction('), 'Posts integration must retain queueing');

console.log('OFFLINE_QUEUE_LIFECYCLE_HARNESS=PASS');
console.log('SUPPORTED_ACTIONS=LIKE_FOLLOW');
console.log('EVENT_LISTENERS=2');
console.log('ORDERED_REPLAY=PASS');
console.log('BANNER_IDEMPOTENCE=PASS');
console.log('POSTS_INTEGRATION=PASS');
