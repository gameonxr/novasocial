/**
 * NovaSocial Notifications feature.
 *
 * Extracted as a classic script so notification filters, click routing,
 * unread state, and realtime setup remain window-global and source-compatible.
 */
// ── NOTIFICATIONS ──────────────────────────────────────
async function checkUnreadNotifs(){
  try{
    const{count}=await db.from('notifications').select('id',{count:'exact',head:true}).eq('recipient_id',ME.id).eq('is_read',false);
    const dot=document.getElementById('notif-dot');
    if(dot){
      if(count > 0){dot.style.display='flex';dot.textContent = count > 99 ? '99+' : count;}else{dot.style.display='none';}
    }
  }catch(e){}
}

let notifFilter = 'all';
function setNotifFilter(type, btnEl){
  notifFilter = type;
  // FIXED: Use passed element instead of event.target (which fails on text nodes)
  document.querySelectorAll('.notif-pill').forEach(btn=>{btn.classList.remove('active');btn.style.background='#111';btn.style.color='#aaa';});
  if(btnEl){btnEl.classList.add('active');btnEl.style.background='#fff';btnEl.style.color='#000';}
  else{
    // Fallback: find by data attr
    const target=document.querySelector(`.notif-pill[data-type="${type}"]`);
    if(target){target.classList.add('active');target.style.background='#fff';target.style.color='#000';}
  }
  renderNotifs();
}

async function clearAllNotifs() {
  if(!confirm('Clear all notifications?')) return;
  await db.from('notifications').delete().eq('recipient_id', ME.id);
  toast('Notifications cleared');
  renderNotifs();
}

function notifIconSvg(type){
  const c = '#fff';
  const icons = {
    like: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    comment_like: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    comment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
    comment_reply: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>`,
    follow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>`,
    mention: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M16 12a4 4 0 108 0 8 8 0 10-2.34 5.66"/></svg>`,
    story_reply: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>`,
    story_reaction: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    story_mention: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    post_share: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    new_post: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    message: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
    message_reaction: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    group_invite: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
    close_friend: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700"><polygon points="12 2 15 9 22 9 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9 9 9"/></svg>`,
    verification: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#3897F0"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFA500" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    live_stream: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C"><circle cx="12" cy="12" r="8"/></svg>`,
    admin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  };
  return icons[type] || `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`;
}

async function renderNotifs(){
  const myGeneration = _renderGeneration; // 🛡️ Capture generation
  const scr=document.getElementById('screen');
  // Part 8 Fix 2: explicit column list instead of select('*') — saves bandwidth on notifications query.
  // Verified fields: renderNotifs uses type, sender_id, post_id, conversation_id, story_id, is_read,
  // message, created_at + joined sender fields (username, avatar_url).
  // id included defensively (Supabase join relation needs it, even though n.id not explicitly accessed).
  // recipient_id included for mark-as-read UPDATE filter (.eq('recipient_id', ME.id) in line 2927/2940).
  const {data:notifs}=await db.from('notifications').select(`id,type,sender_id,recipient_id,post_id,conversation_id,story_id,is_read,message,created_at,sender:profiles!notifications_sender_id_fkey(username,avatar_url)`).eq('recipient_id',ME.id).order('created_at',{ascending:false}).limit(50);
  const { data: myFollowing } = await db.from('follows').select('following_id').eq('follower_id', ME.id);
  const followingSet = new Set((myFollowing || []).map(x => x.following_id));

  const texts={like:'liked your post',follow:'started following you',comment_like:'liked your comment',comment_reply:'replied to your comment',mention:'mentioned you',story_reply:'replied to your story',story_reaction:'reacted to your story',post_share:'shared your post',new_post:'shared a new post',group_invite:'added you to a group',close_friend:'added you as close friend',live_stream:'started a live stream',comment:'commented'};
  const iconsAll={}; // legacy — replaced by notifIconSvg()
  let filteredNotifs = notifs || [];
  if(notifFilter !== 'all'){filteredNotifs = filteredNotifs.filter(n => n.type === notifFilter);}

  let html = `<div class="topbar" style="flex-direction:column;align-items:center;padding-top:20px;padding-bottom:12px;border-bottom:1px solid #111;overflow-x:hidden;width:100%;max-width:100vw;box-sizing:border-box;">`;
  html += `<div style="display:flex;justify-content:space-between;width:100%;align-items:center;margin-bottom:14px;padding:0 16px;box-sizing:border-box;">`;
  html += `<div style="font-weight:800;font-size:22px;">Notifications</div>`;
  if(notifs?.length) {
    html += `<button onclick="clearAllNotifs()" style="background:transparent;border:none;color:#E1306C;font-weight:600;font-size:13px;cursor:pointer;">Clear All</button>`;
  }
  html += `</div>`;
  html += `<div style="display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:4px 16px 8px;scrollbar-width:none;-ms-overflow-style:none;white-space:nowrap;max-width:100%;box-sizing:border-box;-webkit-overflow-scrolling:touch;">`;
  html += `<button data-type="all" onclick="setNotifFilter('all',this)" class="notif-pill ${notifFilter==='all'?'active':''}" style="flex-shrink:0">All</button>`;
  html += `<button data-type="like" onclick="setNotifFilter('like',this)" class="notif-pill ${notifFilter==='like'?'active':''}" style="flex-shrink:0">Likes</button>`;
  html += `<button data-type="comment" onclick="setNotifFilter('comment',this)" class="notif-pill ${notifFilter==='comment'?'active':''}" style="flex-shrink:0">Comments</button>`;
  html += `<button data-type="mention" onclick="setNotifFilter('mention',this)" class="notif-pill ${notifFilter==='mention'?'active':''}" style="flex-shrink:0">Mentions</button>`;
  html += `<button data-type="follow" onclick="setNotifFilter('follow',this)" class="notif-pill ${notifFilter==='follow'?'active':''}" style="flex-shrink:0">Follows</button>`;
  html += `<button data-type="story_reply" onclick="setNotifFilter('story_reply',this)" class="notif-pill ${notifFilter==='story_reply'?'active':''}" style="flex-shrink:0">Stories</button>`;
  html += `<button data-type="message" onclick="setNotifFilter('message',this)" class="notif-pill ${notifFilter==='message'?'active':''}" style="flex-shrink:0">Messages</button>`;
  html += `</div></div>`;

  if(!notifs?.length) {
    html += `<div style="text-align:center;padding:60px 20px;color:#444"><div style="font-size:52px;margin-bottom:16px">🔔</div><div style="font-weight:700;font-size:17px;color:#fff">Koi notification nahi abhi</div><div style="font-size:14px;margin-top:6px">Jab koi like/comment/follow karega yahan dikhega</div></div>`;
  } else {
    // ── Part 11 Fix: Group consecutive like/follow notifications at display time ──
    // Groups consecutive notifications of type 'like' (same post_id) or 'follow'
    // into a single display entry: "X and N others liked your post" / "followed you".
    // Only groups consecutive items in the already-sorted array (within same 50-fetch batch).
    // Does NOT group comments, mentions, messages — those stay individual.
    const GROUP_TYPES = new Set(['like', 'follow']);
    const displayItems = [];
    let i = 0;
    while(i < filteredNotifs.length) {
      const n = filteredNotifs[i];
      if(GROUP_TYPES.has(n.type)) {
        // Start collecting consecutive same-type + same-target notifications
        const group = [n];
        let j = i + 1;
        while(j < filteredNotifs.length) {
          const next = filteredNotifs[j];
          if(next.type !== n.type) break;
          // For likes: same post_id. For follows: always group (no post_id).
          if(n.type === 'like' && (next.post_id || null) !== (n.post_id || null)) break;
          group.push(next);
          j++;
        }
        if(group.length > 1) {
          // Create a grouped display item
          displayItems.push({
            isGroup: true,
            type: n.type,
            post_id: n.post_id || '',
            sender: n.sender, // most recent sender (first in array = newest, since sorted desc)
            sender_id: n.sender_id,
            count: group.length,
            created_at: n.created_at, // most recent timestamp
            isUnread: group.some(g => !g.is_read), // unread if ANY in group is unread
            senderIds: group.map(g => g.sender_id),
          });
        } else {
          // Single notification — no grouping needed
          displayItems.push({ isGroup: false, notif: n });
        }
        i = j;
      } else {
        // Non-groupable type — display individually
        displayItems.push({ isGroup: false, notif: n });
        i++;
      }
    }

    displayItems.forEach(item => {
      if(item.isGroup) {
        // ── Grouped notification display ──
        const name = item.sender?.username || 'User';
        const others = item.count - 1;
        let txt;
        if(item.type === 'like') {
          txt = others > 0 ? `and ${others} other${others > 1 ? 's' : ''} liked your post` : 'liked your post';
        } else {
          txt = others > 0 ? `and ${others} other${others > 1 ? 's' : ''} started following you` : 'started following you';
        }
        const isUnread = item.isUnread;
        const opacity = isUnread ? '1' : '0.6';

        // For grouped likes: tap opens the post. For grouped follows: not clickable (no single profile).
        const onClick = item.type === 'like'
          ? `onclick="notifClick('like','${item.sender_id}','${item.post_id}','','')"`
          : '';

        html += `<div class="nitem" style="opacity:${opacity};background:${isUnread?'#0f0f0f':'#0a0a0a'};" ${onClick}>`;
        html += `<div style="position:relative">${av(item.sender?.avatar_url, name, 44)}<div style="position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#111;border:2px solid #000;">${notifIconSvg(item.type)}</div></div>`;
        html += `<div style="flex:1"><div style="color:#fff;font-size:14px;line-height:1.4;"><b>${name}</b> ${txt}</div>`;
        html += `<div style="color:#666;font-size:11px;margin-top:4px;">${ago(item.created_at)}</div></div>`;
        if(isUnread) html += `<div style="width:8px;height:8px;border-radius:50%;background:#0095f6;flex-shrink:0;"></div>`;
        html += `</div>`;
      } else {
        // ── Individual notification display (unchanged from original) ──
        const n = item.notif;
        const icons=iconsAll;
        let txt = n.type==='comment' ? ('commented: '+(n.message||'')) : (n.message||texts[n.type]||'');
        const isUnread = !n.is_read;
        const opacity = isUnread ? '1' : '0.6';

        html += `<div class="nitem" style="opacity:${opacity};background:${isUnread?'#0f0f0f':'#0a0a0a'};" onclick="notifClick('${n.type}','${n.sender_id}','${n.post_id||''}','${n.conversation_id||''}','${n.story_id||''}')">`;
        html += `<div style="position:relative">${av(n.sender?.avatar_url, n.sender?.username, 44)}<div style="position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#111;border:2px solid #000;">${notifIconSvg(n.type)}</div></div>`;
        html += `<div style="flex:1"><div style="color:#fff;font-size:14px;line-height:1.4;"><b>${n.sender?.username || 'User'}</b> ${txt}</div>`;

        if(n.type==='follow' && !followingSet.has(n.sender_id)) {
          html += `<button onclick="event.stopPropagation();followBack('${n.sender_id}',this)" style="padding:6px 12px;border:none;border-radius:8px;background:#0095f6;color:#fff;font-weight:700;cursor:pointer;margin-top:6px;font-size:12px;">Follow Back</button>`;
        }
        html += `<div style="color:#666;font-size:11px;margin-top:4px;">${ago(n.created_at)}</div></div>`;

        if(isUnread) html += `<div style="width:8px;height:8px;border-radius:50%;background:#0095f6;flex-shrink:0;"></div>`;
        html += `</div>`;
      }
    });
  }

  html += `<div style="height:80px"></div>`;
  // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to DOM mat overwrite karo
  if(myGeneration !== _renderGeneration) return;
  if(!scr) return;
  scr.innerHTML = html;

  await db.from('notifications').update({is_read:true}).eq('recipient_id',ME.id).eq('is_read',false);
  const dot=document.getElementById('notif-dot'); if(dot) dot.style.display='none';
}

async function followBack(userId, btn){
  btn.disabled = true;btn.textContent = "Following";
  const { error } = await db.from('follows').insert({follower_id: ME.id,following_id: userId});
  if(error){btn.disabled = false;btn.textContent = "Follow Back";return;}
  btn.style.background = "#262626";
}

async function notifClick(type, senderId, postId, conversationId, storyId){
  // Mark as read on click bhi (extra safety, already list-load pe hota hai)
  try{ await db.from('notifications').update({is_read:true}).eq('recipient_id',ME.id).eq('sender_id',senderId).eq('type',type); }catch(e){}

  switch(type){
    case 'follow':
      showUserProfile(senderId);
      break;

    case 'like':
    case 'comment':
    case 'comment_like':
    case 'comment_reply':
      if(postId) viewPost(postId);
      else showUserProfile(senderId);
      break;

    case 'mention':
      // 'mention' type dono kaam ke liye use hota hai — chat mention (conversation_id hota hai)
      // aur post-caption mention (post_id hota hai). Pehle conversation check karo.
      if(conversationId){
        try{
          const{data:convInfo}=await db.from('conversations').select('is_group,group_name').eq('id',conversationId).maybeSingle();
          openChat(conversationId, convInfo?.is_group ? (convInfo.group_name||'Group') : 'Chat', convInfo?.is_group||false);
        }catch(e){ go('dms'); }
      } else if(postId){
        viewPost(postId);
      } else {
        showUserProfile(senderId);
      }
      break;

    case 'story_reply':
    case 'story_reaction':
    case 'story_mention':
      if(storyId){
        // Story viewer kholo us specific story pe
        try{
          const{data:allActiveStories}=await db.from('stories').select('*,profiles!stories_user_id_fkey(username,avatar_url)').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false});
          if(allActiveStories?.length){
            const idx = allActiveStories.findIndex(s=>s.id===storyId);
            if(idx > -1){
              svData = allActiveStories;
              openSV(idx);
              return;
            }
          }
          toast('Story expire ho chuki hai');
        }catch(e){ showUserProfile(senderId); }
      } else {
        showUserProfile(senderId);
      }
      break;

    case 'mention_chat':
    case 'message':
    case 'message_reaction':
      if(conversationId){
        // Chat/DM kholo directly
        try{
          const{data:convInfo}=await db.from('conversations').select('is_group,group_name').eq('id',conversationId).maybeSingle();
          openChat(conversationId, convInfo?.is_group ? (convInfo.group_name||'Group') : 'Chat', convInfo?.is_group||false);
        }catch(e){ go('dms'); }
      } else {
        go('dms');
      }
      break;

    case 'group_invite':
      if(conversationId){
        try{
          const{data:convInfo}=await db.from('conversations').select('group_name').eq('id',conversationId).maybeSingle();
          openChat(conversationId, convInfo?.group_name||'Group', true);
        }catch(e){ go('dms'); }
      } else {
        go('dms');
      }
      break;

    case 'post_share':
      if(postId) viewPost(postId);
      break;

    case 'new_post':
      if(postId) viewPost(postId);
      else showUserProfile(senderId);
      break;

    case 'close_friend':
      showUserProfile(senderId);
      break;

    case 'verification':
      showEdit();
      break;

    case 'warning':
    case 'admin':
      toast('Details ke liye Settings > Account check karo');
      break;

    case 'live_stream':
      toast('Live stream feature abhi available nahi hai');
      break;

    default:
      showUserProfile(senderId);
  }
}

function setupNotifsRealtime(){
  if(window.notifsSub) db.removeChannel(window.notifsSub);
  window.notifsSub = db.channel('notifs-' + ME.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`recipient_id=eq.${ME.id}`},(payload)=>{
    const dot=document.getElementById('notif-dot');
    if(dot) dot.style.display='block';
    renderNotifs();
  }).subscribe();
}
