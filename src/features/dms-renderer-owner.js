window.renderDMs = async function(){
  const myGeneration = _renderGeneration; // 🛡️ Capture generation
  const scr=document.getElementById('screen');

  // ── PARALLEL DATA FETCH (Instagram-style simultaneous appear) ──
  // Conversation list + unread map + notes bar data — all fetched at the same time,
  // so when DOM is rendered below, notes bar populates INSTANTLY alongside the chat list
  // (no visible stagger where chat list appears first and notes bar populates a beat later).
  // The `other-members` query stays sequential below because it depends on `convos` from `mem`.
  const [memRes, unreadRes, notesData] = await Promise.all([
    db.from('conversation_members').select('conversation_id,conversations(*)').eq('user_id',ME.id),
    db.from('messages').select('conversation_id').is('seen_at', null).neq('sender_id', ME.id),
    _fetchNotesBarData(),
  ]);
  const mem = memRes.data || [];
  const convos=mem.map(m=>m.conversations).filter(Boolean).sort((a,b)=>new Date(b.last_message_at)-new Date(a.last_message_at));
  const unreadMap = {};
  (unreadRes.data || []).forEach(r => { unreadMap[r.conversation_id] = (unreadMap[r.conversation_id] || 0) + 1; });

  const oneOnOneIds=convos.filter(c=>!c.is_group).map(c=>c.id);
  let otherMap={};
  if(oneOnOneIds.length){
    const{data:others}=await db.from('conversation_members').select('conversation_id,user_id,profiles!conversation_members_user_id_fkey(username,avatar_url,last_seen)').in('conversation_id',oneOnOneIds).neq('user_id',ME.id);
    (others||[]).forEach(o=>{otherMap[o.conversation_id]=o.profiles;});
  }

  let convosHtml = '';
  if(!convos.length){
    convosHtml = '<div style="text-align:center;padding:60px 20px;color:#444"><div style="font-size:52px;margin-bottom:16px">💬</div><div style="font-weight:700;font-size:17px;color:#fff;margin-bottom:8px">Koi message nahi</div><button class="bgrd" onclick="showNewDM()" style="width:auto;padding:13px 28px;margin-top:8px">New Message</button></div>';
  } else {
    convos.forEach(c => {
      const other=otherMap[c.id];
      const name=c.is_group?c.group_name:(other?.username||'Chat');
      const safeName = name.replace(/'/g, "\\'");
      const online=other?isOnline(other.last_seen):false;
      const onlineDot = online ? '<div style="position:absolute;bottom:0;right:0;width:14px;height:14px;background:#3db83d;border-radius:50%;border:2px solid #000;"></div>' : '';

      let avatarHtml = '';
      if(c.is_group) {
        avatarHtml = c.group_avatar ? '<div style="width:54px;height:54px;border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="'+c.group_avatar+'" style="width:100%;height:100%;object-fit:cover;"></div>' : '<div style="width:54px;height:54px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">👥</div>';
      } else {
        avatarHtml = '<div style="position:relative;width:54px;height:54px;flex-shrink:0;">' + av(other?.avatar_url,other?.username,54,false,false) + onlineDot + '</div>';
      }

      let unreadBadge = unreadMap[c.id] ? '<div style="min-width:20px;height:20px;border-radius:10px;background:#E1306C;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 6px;">'+(unreadMap[c.id] > 99 ? '99+' : unreadMap[c.id])+'</div>' : '';

      // Stamp data-cid on each item so _refreshDmsInPlace can find them cleanly
      // without parsing onclick attributes on future background refreshes.
      convosHtml += '<div class="clist" data-cid="'+c.id+'" onclick="openChat(\''+c.id+'\',\''+safeName+'\','+c.is_group+')">'+avatarHtml+'<div style="flex:1;overflow:hidden"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-weight:700;font-size:15px">'+esc(name)+'</span><div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'+unreadBadge+'<span style="color:#444;font-size:11px">'+ago(c.last_message_at)+'</span></div></div><div style="color:#555;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.last_message||'Tap to open')+'</div></div></div>';
    });
  }

  // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to DOM mat overwrite karo
  if(myGeneration !== _renderGeneration) return;
  if(!scr) return;
  scr.innerHTML=`
  <div class="topbar">
    <span style="font-weight:700;font-size:18px">Messages</span>
    <div style="display:flex;gap:16px">
      <div onclick="showGC()" style="cursor:pointer">${ico('group')}</div>
      <div onclick="showNewDM()" style="cursor:pointer">${ico('plus')}</div>
    </div>
  </div>
  <!-- 📝 Notes Bar (Instagram-style, better — text + music + visibility) -->
  <div id="notes-bar" class="notes-bar"></div>
  ${convosHtml}
  <div style="height:80px"></div>`;

  // 📝 Render notes bar using data ALREADY fetched in parallel above — instant, no fetch here.
  _renderNotesBarHtml(notesData);

  // ── NO END-OF-CYCLE SCROLL RESTORATION NEEDED ──
  // renderDMs() is now ONLY called on primary entry (cache miss / first load / go('dms')
  // from chat-close). It is NEVER called by _silentBackgroundRefresh for dms — that path
  // now uses _refreshDmsInPlace() (non-destructive in-place DOM patching).
  //
  // On primary entry, _tabScrollPos['dms'] is either 0 (first load) or whatever was saved
  // when the user last left DMs. The fast-restore path in _tryRestoreFromCache handles
  // scroll restoration on tab-switch-return. For the rare primary-entry case (cache miss),
  // starting at scrollTop=0 is correct (it's a fresh load).
  //
  // Previously there was a double-rAF scrollTop restoration here, but it was only needed
  // because the background refresh was calling renderDMs() destructively. With the
  // non-destructive refresh in place, this is no longer needed — removed.
}
