function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const PREF_MAP = { story_reply: 'story_replies', story_reaction: 'story_reactions', follow: 'follows', message: 'messages' };

async function mockSendNotif({ recipientId, type, extra = {}, blocked = false, blockQueryFails = false, wants = true, prefRpcFails = false, insertFails = false }) {
  const events = [];
  if (!recipientId || recipientId === 'me') return { events: ['noop.recipient'], inserted: false };
  if (blocked) return { events: ['noop.blocked'], inserted: false };
  if (blockQueryFails) events.push('block.query.failed.continue');
  const prefCol = PREF_MAP[type];
  if (prefCol) {
    if (prefRpcFails) events.push('pref.rpc.failed.continue');
    else if (wants === false) return { events: ['noop.preference'], inserted: false };
  }
  const payload = {
    recipient_id: recipientId,
    sender_id: 'me',
    type,
    post_id: extra.post_id || null,
    comment_id: extra.comment_id || null,
    conversation_id: extra.conversation_id || null,
    story_id: extra.story_id || null,
    message: extra.message || ''
  };
  if (insertFails) return { events: ['notifications.insert.failed.swallowed'], inserted: false, payload };
  return { events: [...events, 'notifications.insert'], inserted: true, payload };
}

(async () => {
  const self = await mockSendNotif({ recipientId: 'me', type: 'follow' });
  const empty = await mockSendNotif({ recipientId: '', type: 'follow' });
  const blocked = await mockSendNotif({ recipientId: 'u2', type: 'follow', blocked: true });
  const optedOut = await mockSendNotif({ recipientId: 'u2', type: 'story_reply', wants: false });
  const success = await mockSendNotif({ recipientId: 'u2', type: 'story_reply', extra: { story_id: 's1', message: 'reply' } });
  const queryFailure = await mockSendNotif({ recipientId: 'u2', type: 'follow', blockQueryFails: true, prefRpcFails: true, extra: { conversation_id: 'c1' } });
  const insertFailure = await mockSendNotif({ recipientId: 'u2', type: 'message', insertFails: true, extra: { conversation_id: 'c1', message: 'hello' } });

  assert(!self.inserted && self.events.includes('noop.recipient'), 'Self-recipient notification must be suppressed');
  assert(!empty.inserted && empty.events.includes('noop.recipient'), 'Empty recipient notification must be suppressed');
  assert(!blocked.inserted && blocked.events.includes('noop.blocked'), 'Blocked recipient must not receive notification');
  assert(!optedOut.inserted && optedOut.events.includes('noop.preference'), 'Preference opt-out must suppress mapped notification');
  assert(success.inserted && success.payload.recipient_id === 'u2' && success.payload.sender_id === 'me' && success.payload.story_id === 's1' && success.payload.message === 'reply', 'Successful notification must map recipient, sender, type, story, and message');
  assert(queryFailure.inserted && queryFailure.events.includes('block.query.failed.continue') && queryFailure.events.includes('pref.rpc.failed.continue'), 'Block/preference lookup errors must not prevent notification attempt');
  assert(!insertFailure.inserted && insertFailure.events.includes('notifications.insert.failed.swallowed'), 'Notification insert failure must be swallowed after logging boundary');

  console.log(JSON.stringify({ passed: true, self, empty, blocked, optedOut, success, queryFailure, insertFailure }, null, 2));
})();
