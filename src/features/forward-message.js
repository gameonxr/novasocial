// forwardMessage — extracted from index.html
// Owner SHA-256: 47f0c4da581ffda6a26cef39cc1f4b60f519b9e4b1bf8338ac7480e873d78e4b
// Classic script — exposes window.forwardMessage

window.forwardMessage = async function forwardMessage(sourceMessageId) {
  const m = modal('Forward message');
  const body = m && m.querySelector('#mbody');
  if (!body) return;
  window._forwardMessagePending = null;
  body.innerHTML = '<div style="padding:24px;text-align:center;color:#aaa">Loading conversations...</div>';
  try {
    if (!ME || !ME.id) throw new Error('AUTH_REQUIRED');
    const { data: source, error: sourceError } = await db.from('messages')
      .select('id,text,media_url,media_type,shared_post_id,sender_id,conversation_id')
      .eq('id', sourceMessageId).single();
    if (sourceError) throw sourceError;
    if (!source || source.id !== sourceMessageId || (!source.text && !source.media_url && !source.shared_post_id)) {
      throw new Error('MESSAGE_UNAVAILABLE');
    }

    const { data: memberships, error: membershipError } = await db.from('conversation_members')
      .select('conversation_id,conversations(*)').eq('user_id', ME.id);
    if (membershipError) throw membershipError;
    const destinations = (memberships || []).map(row => row.conversations).filter(conversation => (
      conversation && conversation.is_group !== true && conversation.id !== source.conversation_id
    ));
    const destinationIds = destinations.map(conversation => conversation.id);
    const otherMap = {};
    if (destinationIds.length) {
      const { data: others, error: otherError } = await db.from('conversation_members')
        .select('conversation_id,user_id,profiles!conversation_members_user_id_fkey(username,avatar_url)')
        .in('conversation_id', destinationIds).neq('user_id', ME.id);
      if (otherError) throw otherError;
      (others || []).forEach(row => { otherMap[row.conversation_id] = row; });
    }

    if (!destinations.length) {
      body.innerHTML = '<div style="padding:24px;text-align:center;color:#aaa">No eligible existing conversation found.</div><button class="bout" style="width:100%;margin-top:12px" onclick="closeModal()">Cancel</button>';
      return;
    }

    window._forwardMessagePending = {
      source,
      destinations: destinations.map(conversation => ({
        id: conversation.id,
        other: otherMap[conversation.id] || null,
      })),
      busy: false,
    };
    body.innerHTML = '<div style="padding:8px 0;color:#aaa;font-size:12px">Choose one existing conversation</div>';
    destinations.forEach(conversation => {
      const row = otherMap[conversation.id];
      const name = row?.profiles?.username || 'Chat';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bout';
      button.style.cssText = 'border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;';
      button.textContent = name;
      button.dataset.conversationId = conversation.id;
      button.addEventListener('click', () => completeForwardMessage(conversation.id));
      body.appendChild(button);
    });
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'bout';
    cancel.style.cssText = 'border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#aaa;margin-top:8px;';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => closeModal());
    body.appendChild(cancel);
  } catch (error) {
    window._forwardMessagePending = null;
    body.innerHTML = '<div style="padding:24px;text-align:center;color:#aaa">Unable to load conversations.</div><button class="bout" style="width:100%;margin-top:12px" onclick="closeModal()">Cancel</button>';
    toast('Forward unavailable');
    console.error('Forward message setup failed:', error);
  }
};
