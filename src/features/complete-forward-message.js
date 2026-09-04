// completeForwardMessage — extracted from index.html
// Owner SHA-256: 1f5de88e740c640861279c5ad0a1b59db6bdf8b376ac58482ef67619285d43b6
// Classic script — exposes window.completeForwardMessage

window.completeForwardMessage = async function completeForwardMessage(destinationConversationId) {
  const pending = window._forwardMessagePending;
  if (!pending || pending.busy) return;
  const destination = pending.destinations.find(item => item.id === destinationConversationId);
  if (!destination || !ME || !ME.id) {
    toast('Forward unavailable');
    return;
  }
  pending.busy = true;
  try {
    if (destination.other?.user_id && await isMessagingBlocked(destination.other.user_id)) {
      toast("You can't send messages to this user");
      pending.busy = false;
      return;
    }
    const source = pending.source;
    const payload = { conversation_id: destination.id, sender_id: ME.id };
    for (const field of ['text', 'media_url', 'media_type', 'shared_post_id']) {
      if (source[field] !== undefined && source[field] !== null) payload[field] = source[field];
    }
    await db.from('messages').insert(payload).throwOnError();
    window._forwardMessagePending = null;
    closeModal();
    toast('Message forwarded');
  } catch (error) {
    pending.busy = false;
    if (error?.message?.includes('MESSAGING_BLOCKED')) toast("You can't send messages to this user");
    else toast('Message forward nahi hua 😕');
    console.error('Forward message failed:', error);
  }
};
