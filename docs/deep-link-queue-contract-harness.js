const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const helperSource = fs.readFileSync(path.join(repo, 'src', 'features', 'deep-links.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const events = [];
const timers = [];
const profileRows = { alice: { id: 'user-alice' } };

const context = {
  console: { warn() {} },
  ME: { id: 'me-1' },
  toast(message) { events.push(`toast:${message}`); },
  goToProfile(id) { events.push(`profile.open:${id}`); },
  openChat(id, name, isGroup) { events.push(`chat.open:${id}:${name}:${isGroup}`); },
  async viewPost(id) { events.push(`post.open:${id}`); },
  setTimeout(callback, delay) { timers.push({ callback, delay }); if (delay === 300) callback(); return timers.length; },
};

context.db = {
  from(table) {
    if (table === 'conversation_members') {
      return {
        insert(row) {
          events.push(`group.insert:${row.conversation_id}:${row.user_id}:${row.is_admin}`);
          return Promise.resolve({ error: null });
        },
      };
    }
    assert.strictEqual(table, 'profiles', 'only profile lookups may use the fallback table');
    return {
      select() { return this; },
      eq(_column, value) {
        return {
          async maybeSingle() {
            events.push(`profile.lookup:${value}`);
            return { data: profileRows[value] || null, error: null };
          },
        };
      },
    };
  },
};

vm.createContext(context);
vm.runInContext(helperSource, context, { filename: 'deep-links.js' });

(async () => {
  const uuid = '123e4567-e89b-12d3-a456-426614174000';
  assert.strictEqual(await context.resolveAndOpenProfile(uuid), true, 'UUID profile references must route directly');
  assert.deepStrictEqual(events.splice(0), [`profile.open:${uuid}`], 'UUID routing must not perform a database lookup');

  assert.strictEqual(await context.resolveAndOpenProfile('alice'), true, 'username profile references must resolve');
  assert.deepStrictEqual(events.splice(0), ['profile.lookup:alice', 'profile.open:user-alice'], 'username routing must lookup then open the profile');

  assert.strictEqual(await context.resolveAndOpenProfile('missing'), false, 'missing profile references must fail safely');
  assert.deepStrictEqual(events.splice(0), ['profile.lookup:missing', 'toast:Profile not found'], 'missing profiles must show the existing not-found toast');

  timers.length = 0;
  await context.processDeepLinks([
    { type: 'gc', ref: 'gc-1' },
    { type: 'post', ref: 'post-1' },
    { type: 'user', ref: uuid },
  ]);
  assert.deepStrictEqual(events.splice(0), [
    'group.insert:gc-1:me-1:false',
    'toast:Joined group via link!',
    'post.open:post-1',
    `profile.open:${uuid}`,
  ], 'deep links must process sequentially in queue order');
  assert.deepStrictEqual(timers.filter((timer) => timer.delay === 1000).map((timer) => timer.delay), [1000], 'successful group joins must defer openChat by 1000ms');

  await context.processDeepLinks([]);
  await context.processDeepLinks(null);
  assert.deepStrictEqual(events, [], 'empty queues must be safe no-ops');
  assert.strictEqual(await context.resolveAndOpenProfile(''), false, 'empty profile reference must be rejected');

  assert(indexSource.includes("if (gcId)    pendingDeepLinks.push({ type: 'gc',   ref: gcId });"), 'inline queue must collect gc deep links');
  assert(indexSource.includes("if (postRef) pendingDeepLinks.push({ type: 'post', ref: postRef });"), 'inline queue must collect post deep links');
  assert(indexSource.includes("if (userRef) pendingDeepLinks.push({ type: 'user', ref: userRef });"), 'inline queue must collect user deep links');
  assert(indexSource.includes('window._pendingDeepLinks = pendingDeepLinks;'), 'logged-out deep links must persist in the window queue');
  assert(indexSource.includes('setTimeout(() => processDeepLinks(links), 500);'), 'post-login dispatch must retain the 500ms settling delay');

  console.log('DEEP_LINK_QUEUE_HARNESS=PASS');
  console.log('SUPPORTED_TYPES=gc,post,user');
  console.log('QUEUE_ORDER=PASS');
  console.log('AUTH_DEFERRED_QUEUE=PASS');
  console.log('PROFILE_UUID_AND_USERNAME=PASS');
  console.log('GROUP_OPEN_DELAY_MS=1000');
  console.log('POST_LOGIN_DELAY_MS=500');
  console.log('INTER_LINK_SETTLE_MS=300');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
