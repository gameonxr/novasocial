// unsendMsg — extracted from index.html
// Owner SHA-256: a771645f66dc4de66656b16f74747a7d91281c49c9ee0e26d61395371610077d
// Classic script — exposes window.unsendMsg

window.unsendMsg = async function unsendMsg(mid){
  const ok=confirm('Unsend this message?');
  if(!ok) return;

  // Close menu if open
  const box=document.getElementById('react-box'); if(box) box.remove();

  // ── STEP 1: Fetch media_url + ownership before update ──
  let mediaUrlToClean = null;
  let conversationId = null;
  try {
    const { data: msg } = await db
      .from('messages')
      .select('media_url, sender_id, conversation_id')
      .eq('id', mid)
      .maybeSingle();
    conversationId = msg?.conversation_id || null;
    if(msg && msg.sender_id === ME.id && msg.media_url) {
      mediaUrlToClean = msg.media_url;
    }
  } catch(e) { /* non-critical */ }

  // Instant DOM Removal (No Reload)
  const msgEl = document.querySelector('[data-msgid="'+mid+'"]');
  if(msgEl) {
    msgEl.style.transition = '0.3s';
    msgEl.style.opacity = '0';
    msgEl.style.transform = 'translateX(-20px)';
  }

  // ── STEP 2: DB Update — set deleted, clear text AND media_url ──
  try {
    await db.from('messages').update({
      deleted: true,
      text: '',
      media_url: null,
    }).eq('id', mid);
  } catch(e) {
    console.error('Unsend DB update failed:', e);
    toast('❌ Unsend failed');
    return;
  }

  // Keep the denormalized DMs preview aligned with the newest active message.
  // This is non-critical to unsend itself: a preview failure must not undo deletion.
  if(conversationId) {
    try {
      const { data: recentMsgs } = await db
        .from('messages')
        .select('id, text, media_type, deleted, created_at')
        .eq('conversation_id', conversationId)
        .neq('id', mid)
        .order('created_at', { ascending: false })
        .limit(20);
      const previous = (recentMsgs || []).find(m => !m.deleted);
      const preview = previous ? (previous.text || (previous.media_type ? '[' + previous.media_type + ' message]' : '')) : null;
      await db.from('conversations').update({
        last_message: preview,
        last_message_at: previous?.created_at || null,
      }).eq('id', conversationId);
    } catch(e) {
      console.warn('Conversation preview cleanup failed:', e.message);
    }
  }

  // ── STEP 3: Cloudinary media cleanup (production engine) ──
  if(mediaUrlToClean) {
    deleteMediaProduction(mediaUrlToClean, 'chat', 'user_delete').catch(() => {});
  }

  // Update UI to show "Unsent" after animation
  setTimeout(() => {
    if(msgEl) {
      msgEl.style.opacity = '1';
      msgEl.style.transform = 'translateX(0)';
      msgEl.innerHTML = '<i style="color:#888">This message was unsent</i><div style="font-size:10px;margin-top:3px;text-align:right"><span style="color:rgba(255,255,255,0.3)">just now</span></div>';
      msgEl.className = msgEl.className.includes('mme') ? 'mme' : 'mthem';
      msgEl.style.maxWidth = '72%';
    }
  }, 300);
};
