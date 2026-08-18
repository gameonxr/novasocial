function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockSendAdminNotification({ recipientId = 'u2', msg = 'Account update', dbFails = false }) {
  const events = [];
  const payload = { recipient_id: recipientId, sender_id: 'me', type: 'admin', message: msg };
  if (dbFails) return { events: ['notifications.insert.failed.swallowed'], inserted: false, payload };
  events.push('notifications.insert');
  return { events, inserted: true, payload };
}

(async () => {
  const success = await mockSendAdminNotification({ recipientId: 'u2', msg: 'Your account was updated.' });
  const failure = await mockSendAdminNotification({ recipientId: 'u2', msg: 'Your account was updated.', dbFails: true });
  const emptyMessage = await mockSendAdminNotification({ recipientId: 'u2', msg: '' });

  assert(success.inserted && success.payload.recipient_id === 'u2' && success.payload.sender_id === 'me' && success.payload.type === 'admin' && success.payload.message === 'Your account was updated.', 'Admin notification must map recipient, current sender, admin type, and message');
  assert(!failure.inserted && failure.events.includes('notifications.insert.failed.swallowed'), 'Admin notification database failure must remain silent/nonfatal');
  assert(emptyMessage.inserted && emptyMessage.payload.message === '', 'Admin notification must preserve an empty message without inventing content');

  console.log(JSON.stringify({ passed: true, success, failure, emptyMessage }, null, 2));
})();
