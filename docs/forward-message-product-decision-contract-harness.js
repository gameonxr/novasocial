
const assert = require('assert');

const decision = Object.freeze({
  maxDestinations: 1,
  allowedMessageFields: ['text', 'media_url', 'media_type', 'shared_post_id'],
  copySourceMetadata: false,
  uploadMedia: false,
  clientBroadcast: false,
  optimisticUi: false,
  createConversation: false,
});

function buildForwardPayload(source, destinationConversationId, senderId) {
  const payload = {
    conversation_id: destinationConversationId,
    sender_id: senderId,
  };
  for (const field of decision.allowedMessageFields) {
    if (source[field] !== undefined && source[field] !== null) payload[field] = source[field];
  }
  return payload;
}

async function simulateForward({ source, destination, senderId, blocked = false, insert }) {
  const events = [];
  const sourceBefore = JSON.stringify(source);
  if (!destination || destination.accessible !== true || destination.deleted === true) {
    events.push('reject:destination');
    return { ok: false, code: 'DESTINATION_UNAVAILABLE', events, inserted: null, sourceUnchanged: JSON.stringify(source) === sourceBefore };
  }
  events.push('policy:destination');
  if (blocked) {
    events.push('reject:blocked');
    return { ok: false, code: 'MESSAGING_BLOCKED', events, inserted: null, sourceUnchanged: JSON.stringify(source) === sourceBefore };
  }
  const payload = buildForwardPayload(source, destination.id, senderId);
  events.push('payload:built');
  let inserted;
  try {
    inserted = await insert(payload, events);
  } catch (error) {
    events.push('insert:failed');
    return { ok: false, code: 'INSERT_FAILED', events, inserted: null, sourceUnchanged: JSON.stringify(source) === sourceBefore };
  }
  events.push('insert:confirmed');
  events.push('ui:success');
  return { ok: true, code: 'FORWARDED', events, inserted, sourceUnchanged: JSON.stringify(source) === sourceBefore };
}

(async () => {
  const source = {
    id: 'source-1',
    sender_id: 'original-sender',
    conversation_id: 'source-conversation',
    text: 'hello',
    media_url: 'https://synthetic.invalid/media.jpg',
    media_type: 'image',
    shared_post_id: 'post-1',
    created_at: '2026-08-25T00:00:00.000Z',
    reply_to: 'reply-1',
    reactions: ['heart'],
    read_at: '2026-08-25T00:01:00.000Z',
  };
  const destination = { id: 'destination-1', accessible: true, deleted: false };
  const calls = [];

  const success = await simulateForward({
    source,
    destination,
    senderId: 'current-user',
    insert: async (payload, events) => {
      calls.push({ type: 'insert', payload });
      assert.deepStrictEqual(events, ['policy:destination', 'payload:built']);
      return { id: 'synthetic-new-message', ...payload };
    },
  });
  assert.strictEqual(success.ok, true);
  assert.strictEqual(success.code, 'FORWARDED');
  assert.strictEqual(success.sourceUnchanged, true);
  assert.deepStrictEqual(success.inserted, {
    id: 'synthetic-new-message',
    conversation_id: 'destination-1',
    sender_id: 'current-user',
    text: 'hello',
    media_url: 'https://synthetic.invalid/media.jpg',
    media_type: 'image',
    shared_post_id: 'post-1',
  });
  assert.deepStrictEqual(success.events, ['policy:destination', 'payload:built', 'insert:confirmed', 'ui:success']);

  const blocked = await simulateForward({
    source,
    destination,
    senderId: 'current-user',
    blocked: true,
    insert: async () => { throw new Error('insert must not be reached'); },
  });
  assert.strictEqual(blocked.ok, false);
  assert.strictEqual(blocked.code, 'MESSAGING_BLOCKED');
  assert.deepStrictEqual(blocked.events, ['policy:destination', 'reject:blocked']);
  assert.strictEqual(blocked.inserted, null);

  const unavailable = await simulateForward({
    source,
    destination: { id: 'deleted-1', accessible: false, deleted: true },
    senderId: 'current-user',
    insert: async () => { throw new Error('insert must not be reached'); },
  });
  assert.strictEqual(unavailable.ok, false);
  assert.strictEqual(unavailable.code, 'DESTINATION_UNAVAILABLE');
  assert.deepStrictEqual(unavailable.events, ['reject:destination']);

  const failed = await simulateForward({
    source,
    destination,
    senderId: 'current-user',
    insert: async (payload) => {
      calls.push({ type: 'insert-failed', payload });
      throw new Error('synthetic insert failure');
    },
  });
  assert.strictEqual(failed.ok, false);
  assert.strictEqual(failed.code, 'INSERT_FAILED');
  assert.deepStrictEqual(failed.events, ['policy:destination', 'payload:built', 'insert:failed']);
  assert.strictEqual(failed.inserted, null);
  assert.strictEqual(failed.sourceUnchanged, true);

  assert.strictEqual(calls.length, 2, 'only successful and failure-injected inserts may be attempted');
  assert(calls.every(call => call.payload.conversation_id === 'destination-1'));
  assert(calls.every(call => call.payload.sender_id === 'current-user'));
  assert(calls.every(call => !Object.prototype.hasOwnProperty.call(call.payload, 'id')));
  assert(calls.every(call => !Object.prototype.hasOwnProperty.call(call.payload, 'reply_to')));
  assert(calls.every(call => !Object.prototype.hasOwnProperty.call(call.payload, 'created_at')));
  assert(calls.every(call => !Object.prototype.hasOwnProperty.call(call.payload, 'reactions')));
  assert(calls.every(call => !Object.prototype.hasOwnProperty.call(call.payload, 'read_at')));
  assert.strictEqual(decision.maxDestinations, 1);
  assert.strictEqual(decision.copySourceMetadata, false);
  assert.strictEqual(decision.uploadMedia, false);
  assert.strictEqual(decision.clientBroadcast, false);
  assert.strictEqual(decision.optimisticUi, false);
  assert.strictEqual(decision.createConversation, false);

  console.log('FORWARD_MESSAGE_PRODUCT_DECISION_CONTRACT_HARNESS=PASS');
  console.log('SCENARIOS=SUCCESS_BLOCKED_UNAVAILABLE_INSERT_FAILURE');
  console.log('SOURCE_METADATA_COPIED=0');
  console.log('UPLOAD_SIDE_EFFECTS=0');
  console.log('CLIENT_BROADCAST_SIDE_EFFECTS=0');
  console.log('NAVIGATION_SIDE_EFFECTS=0');
  console.log('LIVE_MUTATIONS=0');
  console.log('PRODUCTION_FORWARD_IMPLEMENTATION=0');
})();
