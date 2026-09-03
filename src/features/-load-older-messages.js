// _loadOlderMessages — extracted from index.html
// Owner SHA-256: 53ac6dcb54002821a3d9d5dff2cc5c1d77bf82698386b55caf0ec8aefe6ba22b
// Classic script — exposes window._loadOlderMessages

window._loadOlderMessages = async function _loadOlderMessages(cid, isGrp, list){
  if(!window._msgPagination || !window._msgPagination[cid]) return;
  const pagState = window._msgPagination[cid];
  if(pagState.loading || !pagState.hasMore || !pagState.oldestTimestamp) return;

  pagState.loading = true;

  // Show loading indicator at top
  const loader = document.createElement('div');
  loader.id = 'msg-load-more-loader';
  loader.style.cssText = 'text-align:center;padding:12px;color:#666;font-size:12px';
  loader.innerHTML = '<div class="spin" style="width:20px;height:20px;border:2px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto"></div>';
  list.insertBefore(loader, list.firstChild);

  try {
    const MSG_PAGE_SIZE = 50;
    const { data: olderMsgs } = await db.from('messages')
      .select(`*,profiles!messages_sender_id_fkey(username,avatar_url),replied:reply_to(text, sender_id, profiles!messages_sender_id_fkey(username))`)
      .eq('conversation_id', cid)
      .lt('created_at', pagState.oldestTimestamp)
      .order('created_at', {ascending: false})
      .limit(MSG_PAGE_SIZE);

    const loaderEl = document.getElementById('msg-load-more-loader');
    if(loaderEl) loaderEl.remove();

    if(!olderMsgs || olderMsgs.length === 0){
      pagState.hasMore = false;
      return;
    }

    olderMsgs.reverse();

    pagState.oldestTimestamp = olderMsgs[0]?.created_at || pagState.oldestTimestamp;
    pagState.hasMore = olderMsgs.length >= MSG_PAGE_SIZE;

    // ── CRITICAL: Preserve scroll position across prepend ──
    const oldScrollHeight = list.scrollHeight;
    const oldScrollTop = list.scrollTop;

    // Fetch reactions for older messages
    const {data:reacts}=await db.from('message_reactions').select('*').in('message_id',olderMsgs.map(x=>x.id));
    const reactionMap={};
    (reacts||[]).forEach(r=>{
      if(!reactionMap[r.message_id]) reactionMap[r.message_id]=[];
      reactionMap[r.message_id].push(r.emoji);
    });

    const isSystem=t=>t&&(t.startsWith('✅')||t.startsWith('❌')||t.startsWith('👑')||t.startsWith('👋')||t.startsWith('📞'));
    const now = new Date();
    const validMsgs = olderMsgs.filter(m => !m.expires_at || new Date(m.expires_at) > now);

    let lastDate = '';
    let olderHtml = validMsgs.map(m => {
      const isMe = m.sender_id === ME.id;
      let dateStr = new Date(m.created_at).toLocaleDateString();
      let separator = '';
      if (dateStr !== lastDate) {
        lastDate = dateStr;
        let today = new Date().toLocaleDateString();
        let yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
        let dateLabel = dateStr === today ? 'Today' : dateStr === yesterday ? 'Yesterday' : new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        separator = '<div style="text-align:center;margin:10px 0;"><span style="background:#1a1a1a;color:#aaa;font-size:11px;padding:4px 12px;border-radius:8px;">'+dateLabel+'</span></div>';
      }
      if(isSystem(m.text)) return separator + '<div style="text-align:center;padding:6px 0"><span style="background:#1a1a1a;color:#888;font-size:12px;padding:4px 12px;border-radius:12px">' + m.text + '</span></div>';
      let content = '';
      if (m.deleted) {
        content = '<i style="color:#888">This message was unsent</i>';
      } else if (m.shared_post_id) {
        content = '<div onclick="closeModal();viewPost(\'' + m.shared_post_id + '\')" style="background:#111;padding:10px 12px;border-radius:12px;cursor:pointer;display:flex;align-items:center;gap:8px;">' + ico('cam','#aaa',16) + ' <span style="color:#fff;font-size:13px">View Shared Post</span></div>';
      } else if (m.media_type === 'audio') {
        content = '<div style="display:flex;align-items:center;gap:8px;background:#111;padding:4px 8px;border-radius:12px;"><audio controls src="' + m.media_url + '" style="max-width:150px;height:32px" onended="playNextAudio(this)"></audio><button onclick="changeAudioSpeed(this)" style="background:#333;border:none;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:10px;flex-shrink:0;font-weight:700;">1x</button></div>';
      } else if (m.media_type === 'location') {
        content = '<img src="' + m.media_url + '" style="max-width:180px;border-radius:12px;cursor:pointer" onclick="window.open(\'https://www.google.com/maps?q=' + m.text + '\',\'_blank\')">';
      } else if (m.media_type === 'image') {
        content = '<img src="' + m.media_url + '" style="max-width:180px;border-radius:12px;cursor:pointer" onclick="viewChatImage(\'' + m.media_url + '\')">';
      } else if (m.media_type === 'video') {
        content = '<video controls src="' + m.media_url + '" style="max-width:180px;border-radius:12px"></video>';
      } else {
        let rawText = m.text || '';
        rawText = rawText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#4FC3F7;text-decoration:underline;">$1</a>');
        if (window._chatMembers && rawText.includes('@')) {
          window._chatMembers.forEach(mem => {
            if(mem.profiles?.username) {
              const regex = new RegExp('@' + mem.profiles.username, 'g');
              rawText = rawText.replace(regex, '<span style="color:#4FC3F7;font-weight:600;cursor:pointer;" onclick="closeModal();goToProfile(\'' + mem.user_id + '\')">@' + mem.profiles.username + '</span>');
            }
          });
        }
        content = rawText;
      }
      const encText = encodeURIComponent(m.text || '');
      const encName = encodeURIComponent(m.profiles?.username || '');
      const encMtype = encodeURIComponent(m.media_type || '');
      const encMurl = encodeURIComponent(m.media_url || '');
      let replyContext = '';
      if (m.replied) {
        let replyText = m.replied.text || '📷 Media';
        replyContext = '<div style="border-left:3px solid #E1306C;padding-left:8px;margin-bottom:6px;font-size:12px;color:#bbb;opacity:.9"><b style="color:#fff">'+(m.replied.profiles?.username||'User')+'</b><br>'+replyText+'</div>';
      }
      return separator + '<div style="display:flex;justify-content:' + (isMe?'flex-end':'flex-start') + ';gap:8px;align-items:flex-end;margin-bottom:2px">' +
        (!isMe ? '<div onclick="goToProfile(\'' + m.sender_id + '\')" style="cursor:pointer;flex-shrink:0">' + av(m.profiles?.avatar_url, m.profiles?.username, 28) + '</div>' : '') +
        '<div class="' + (isMe?'mme':'mthem') + '" data-msgid="' + m.id + '" data-sender="' + m.sender_id + '" data-text="' + encText + '" data-name="' + encName + '" data-mtype="' + encMtype + '" data-murl="' + encMurl + '" style="max-width:72%" ontouchstart="swipeStart(event,this)" ontouchmove="swipeMove(event)" ontouchend="swipeEnd(event)" oncontextmenu="event.preventDefault();showMsgMenuFromEl(event,this)" ondblclick="heartReact(\'' + m.id + '\')">' +
        (isGrp && !isMe ? '<div onclick="goToProfile(\'' + m.sender_id + '\')" style="color:#E1306C;font-size:11px;font-weight:700;margin-bottom:4px;cursor:pointer">' + (m.profiles?.username||'') + '</div>' : '') +
        replyContext +
        content +
        (reactionMap[m.id]?.length ? '<div style="margin-top:4px;font-size:13px;display:inline-flex;gap:2px;flex-wrap:wrap;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:10px;animation:reactionPop 0.18s ease">' + reactionMap[m.id].join(' ') + '</div>' : '') +
        '<div style="font-size:10px;margin-top:3px;text-align:right"><span style="color:rgba(255,255,255,0.3)">' + ago(m.created_at) + '</span>' +
        (isMe ? (m.seen_at ? '<span style="color:#4FC3F7"> ✓✓</span>' : '<span style="color:rgba(255,255,255,0.4)"> ✓</span>') : '') +
        '</div></div></div>';
    }).join('');

    // Prepend older messages to the top
    list.insertAdjacentHTML('afterbegin', olderHtml);

    // ── Restore scroll position so view doesn't jump ──
    const newScrollHeight = list.scrollHeight;
    list.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);

  } catch(e) {
    console.error('[MsgPagination] Load older failed:', e);
    const loaderEl = document.getElementById('msg-load-more-loader');
    if(loaderEl) loaderEl.remove();
  } finally {
    pagState.loading = false;
  }
};
