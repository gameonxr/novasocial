// loadMsgs — extracted from index.html
// Owner SHA-256: ad4c9b11104164b4010590e191b36a718b881c097890749246582831081605c2
// Classic script — exposes window.loadMsgs

window.loadMsgs = async function loadMsgs(cid,isGrp){
  const list=document.getElementById('mlist');if(!list)return;

  // Theme Apply
  const { data: cInfo } = await db.from('conversations').select('theme').eq('id', cid).single();
  const cTheme = cInfo?.theme || 'default';
  if(cTheme === 'cyberpunk') list.style.background = "linear-gradient(45deg,#0a0a0a,#1a0533)";
  else if(cTheme === 'tropical') list.style.background = "linear-gradient(45deg,#0a0a0a,#05331a)";
  else if(cTheme === 'pride') list.style.background = "linear-gradient(45deg,#0a0a0a,#330a0a)";
  else list.style.background = "#000";

  await db.from('messages').update({seen_at:new Date().toISOString()}).eq('conversation_id',cid).neq('sender_id',ME.id).is('seen_at',null);

  // ── Part 9 Fix 2: Message pagination — fetch 50 most recent (descending), then reverse for ascending display
  // Was: .limit(400) ascending — loaded too many messages on every chat open
  // Now: .limit(50) descending → reverse array for ascending render
  const MSG_PAGE_SIZE = 50;
    const{data:msgs}=await db.from('messages').select(`*,profiles!messages_sender_id_fkey(username,avatar_url),replied:reply_to(text, sender_id, profiles!messages_sender_id_fkey(username))`).eq('conversation_id',cid).order('created_at',{ascending:false}).limit(MSG_PAGE_SIZE);

  if(!msgs || msgs.length === 0){
    list.innerHTML = '<div style="text-align:center;color:#333;padding:40px;font-size:14px">Baat shuru karo! 👋</div>';
    return;
  }

  // Reverse to ascending order for display (fetched descending to get "most recent 50")
  msgs.reverse();

  // ── Part 9 Fix 2: Track pagination state for "load older" on scroll-to-top ──
  window._msgPagination = window._msgPagination || {};
  window._msgPagination[cid] = {
    oldestTimestamp: msgs[0]?.created_at || null,
    hasMore: msgs.length >= MSG_PAGE_SIZE, // if fewer than 50, conversation start reached
    loading: false
  };

  // ── Part 9 Fix 2: Setup scroll-to-top "load older" listener (only once per list element) ──
  if(!list._msgPaginationListenerAttached){
    list._msgPaginationListenerAttached = true;
    list.addEventListener('scroll', () => {
      if(!window._msgPagination || !window._msgPagination[cid]) return;
      const pagState = window._msgPagination[cid];
      if(pagState.loading || !pagState.hasMore) return;
      // Trigger when user scrolls near top (within 100px)
      if(list.scrollTop < 100){
        _loadOlderMessages(cid, isGrp, list);
      }
    }, { passive: true });
  }

  // Mark as Read
  const unreadMsgs = msgs.filter(m => m.sender_id !== ME.id);
  if(unreadMsgs.length) {
    const readInserts = unreadMsgs.map(m => ({ message_id: m.id, user_id: ME.id }));
    await db.from('message_reads').upsert(readInserts, { onConflict: 'message_id,user_id', ignoreDuplicates: true });
  }

  // Seen By Logic
  let lastMyMsgId = null;
  for(let i = msgs.length - 1; i >= 0; i--) {
    if(msgs[i].sender_id === ME.id && !msgs[i].call_event) {
      lastMyMsgId = msgs[i].id;
      break;
    }
  }
  let seenByHtml = '';
  if(lastMyMsgId) {
    const { data: reads } = await db.from('message_reads').select('user_id').eq('message_id', lastMyMsgId).neq('user_id', ME.id);
    if(reads && reads.length > 0) {
      if(isGrp) seenByHtml = '<div style="text-align:right;font-size:11px;color:#4FC3F7;margin-top:4px;padding-right:4px;">Seen by '+reads.length+' people</div>';
      else seenByHtml = '<div style="text-align:right;font-size:11px;color:#4FC3F7;margin-top:4px;padding-right:4px;">Seen</div>';
    }
  }

  // Reactions Map
  const {data:reacts}=await db.from('message_reactions').select('*').in('message_id',msgs.map(x=>x.id));
  const reactionMap={};
  (reacts||[]).forEach(r=>{
    if(!reactionMap[r.message_id]) reactionMap[r.message_id]=[];
    reactionMap[r.message_id].push(r.emoji);
  });

  const isSystem=t=>t&&(t.startsWith('✅')||t.startsWith('❌')||t.startsWith('👑')||t.startsWith('👋')||t.startsWith('📞'));
  const now = new Date();
  const validMsgs = msgs.filter(m => !m.expires_at || new Date(m.expires_at) > now);

  let lastDate = '';
  let finalHtml = validMsgs.map(m => {
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
      // Auto Linkify URLs
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

    // 100% Safe Encoded Attributes (Zero Crash Risk)
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

  finalHtml += seenByHtml;
  list.innerHTML = finalHtml;
  list.scrollTop = list.scrollHeight;
  setTimeout(()=>initVideoObserver(), 300);
};
