
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8') + '\n' + fs.readFileSync('/home/z/my-project/novasocial/src/features/complete-forward-message.js', 'utf8') + '\n' + fs.readFileSync('/home/z/my-project/novasocial/src/features/forward-message.js', 'utf8');

function extractFunction(source, name) {
  const start = source.search(new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`));
  assert(start >= 0, `production function must exist: ${name}`);
  const open = source.indexOf('{', start);
  assert(open >= 0, `production function body must exist: ${name}`);
  let depth = 0;
  let state = 'code';
  let quote = '';
  let escaped = false;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (state === 'line-comment') {
      if (ch === '\n') state = 'code';
      continue;
    }
    if (state === 'block-comment') {
      if (ch === '*' && next === '/') { state = 'code'; i += 1; }
      continue;
    }
    if (state === 'string') {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) { state = 'code'; quote = ''; }
      continue;
    }
    if (state === 'template') {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '`') { state = 'code'; continue; }
      continue;
    }
    if (ch === '/' && next === '/') { state = 'line-comment'; i += 1; continue; }
    if (ch === '/' && next === '*') { state = 'block-comment'; i += 1; continue; }
    if (ch === '\'' || ch === '"') { state = 'string'; quote = ch; continue; }
    if (ch === '`') { state = 'template'; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`unterminated production function: ${name}`);
}

const production = [extractFunction(html, 'forwardMessage'), extractFunction(html, 'completeForwardMessage')].join('\n');

function createButton() {
  return {
    type: '',
    className: '',
    style: { cssText: '' },
    dataset: {},
    textContent: '',
    listeners: {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
  };
}

function createHarness({ blocked = false, insertFailure = false } = {}) {
  const events = [];
  const inserted = [];
  const body = {
    innerHTML: '',
    children: [],
    appendChild(child) { this.children.push(child); },
  };
  const source = {
    id: 'source-1',
    text: 'hello',
    media_url: 'https://synthetic.invalid/image.jpg',
    media_type: 'image',
    shared_post_id: 'post-1',
    sender_id: 'original-sender',
    conversation_id: 'source-conversation',
  };
  const destination = { id: 'destination-1', is_group: false };
  const group = { id: 'group-1', is_group: true };
  const current = { body };
  const context = {
    console,
    ME: { id: 'current-user' },
    document: {
      createElement() { return createButton(); },
    },
    modal(title) { events.push(`modal:${title}`); return { querySelector() { return body; } }; },
    closeModal() { events.push('close-modal'); },
    toast(message) { events.push(`toast:${message}`); },
    isMessagingBlocked(userId) { events.push(`block-check:${userId}`); return Promise.resolve(blocked); },
    db: {
      from(table) {
        events.push(`from:${table}`);
        const query = {
          select() { return this; },
          eq() { return this; },
          in() { return this; },
          neq() { return this; },
          single() {
            if (table === 'messages') return Promise.resolve({ data: source, error: null });
            return Promise.resolve({ data: null, error: null });
          },
          insert(payload) {
            inserted.push(payload);
            events.push('insert:messages');
            return {
              throwOnError() {
                if (insertFailure) return Promise.reject(new Error('synthetic insert failure'));
                return Promise.resolve({ data: [payload], error: null });
              },
            };
          },
          then(resolve, reject) {
            if (table === 'conversation_members') {
              const result = events.filter(event => event === 'from:conversation_members').length === 1
                ? { data: [{ conversation_id: destination.id, conversations: destination }, { conversation_id: group.id, conversations: group }], error: null }
                : { data: [{ conversation_id: destination.id, user_id: 'other-1', profiles: { username: 'Alice', avatar_url: null } }], error: null };
              return Promise.resolve(result).then(resolve, reject);
            }
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          },
        };
        return query;
      },
    },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(production, context, { filename: 'index.html#forwardMessage' });
  return { context, body, events, inserted, source, current };
}

(async () => {
  const success = createHarness();
  await success.context.forwardMessage('source-1');
  const choice = success.body.children.find(child => child.dataset.conversationId === 'destination-1');
  assert(choice, 'eligible existing one-on-one conversation must render as a choice');
  assert.strictEqual(success.body.children.filter(child => child.dataset.conversationId === 'group-1').length, 0, 'group destinations remain out of the first bounded scope');
  await choice.listeners.click();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(success.inserted)), [{
    conversation_id: 'destination-1',
    sender_id: 'current-user',
    text: 'hello',
    media_url: 'https://synthetic.invalid/image.jpg',
    media_type: 'image',
    shared_post_id: 'post-1',
  }]);
  assert.deepStrictEqual(success.events, [
    'modal:Forward message',
    'from:messages',
    'from:conversation_members',
    'from:conversation_members',
    'block-check:other-1',
    'from:messages',
    'insert:messages',
    'close-modal',
    'toast:Message forwarded',
  ]);
  assert(!success.inserted[0].id && !success.inserted[0].reply_to && !success.inserted[0].created_at, 'source metadata must not be copied');

  const blockedCase = createHarness({ blocked: true });
  await blockedCase.context.forwardMessage('source-1');
  const blockedChoice = blockedCase.body.children.find(child => child.dataset.conversationId === 'destination-1');
  await blockedChoice.listeners.click();
  assert.deepStrictEqual(blockedCase.inserted, []);
  assert(blockedCase.events.includes("toast:You can't send messages to this user"));
  assert(!blockedCase.events.includes('insert:messages'), 'blocked recipient must be rejected before insert');
  assert(!blockedCase.events.includes('close-modal'), 'blocked recipient must not close the selector');

  const failedCase = createHarness({ insertFailure: true });
  await failedCase.context.forwardMessage('source-1');
  const failedChoice = failedCase.body.children.find(child => child.dataset.conversationId === 'destination-1');
  await failedChoice.listeners.click();
  assert(failedCase.events.includes('toast:Message forward nahi hua 😕'));
  assert(!failedCase.events.includes('close-modal'), 'insert failure must preserve the selector for rollback/retry');

  console.log('FORWARD_MESSAGE_PRODUCTION_PARITY_HARNESS=PASS');
  console.log('PRODUCTION_FUNCTIONS=forwardMessage,completeForwardMessage');
  console.log('GROUP_DESTINATIONS=EXCLUDED');
  console.log('SOURCE_METADATA_COPIED=0');
  console.log('BLOCKED_INSERTS=0');
  console.log('INSERT_FAILURE_CLOSE=0');
  console.log('UPLOAD_SIDE_EFFECTS=0');
  console.log('REALTIME_SIDE_EFFECTS=0');
  console.log('NAVIGATION_SIDE_EFFECTS=0');
  console.log('LIVE_MUTATIONS=0');
})();
