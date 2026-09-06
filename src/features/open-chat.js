// openChat — extracted from index.html
// Owner SHA-256: 6db16fe45388a7c7a0cbeaad8ede0377e18d3f8427b0390edf5d810ef73b916b
// Classic script — exposes window.openChat

window.openChat = async function openChat(cid,name,isGrp){
  // Mark the subscreen before the first await so DMs refresh/cache work cannot
  // mistake the chat DOM for the DMs tab during the async open.
  window._chatScreenActive = true;
  const chatGeneration = ++_renderGeneration;

  // NAV-STACK: push chat entry
  pushNavState('chat', cid, function(){
    window._chatScreenActive = false;
    if (window.chatSubscription) {
      db.removeChannel(window.chatSubscription);
      window.chatSubscription = null;
    }
    if (window.typingSub) {
      db.removeChannel(window.typingSub);
      window.typingSub = null;
    }
    go('dms');
  });
  const scr=document.getElementById('screen');
  scr.style.overflow='hidden';
  window._curIsGrp=isGrp;
  window._curChatId=cid;
  window.replyToId=null;
  window.replyToText='';
  window._vanishMode = false;

  let otherProf=null,members=[],gcAvatar='',gcName=name;
  let convoInfo=null;

  const{data:mems}=await db.from('conversation_members').select('user_id,is_admin,profiles!conversation_members_user_id_fkey(username,avatar_url,last_seen)').eq('conversation_id',cid);
  members=mems||[];
  window._chatMembers=members;

  const {data:convoInfoData}=await db.from('conversations').select('*').eq('id',cid).single();
  convoInfo=convoInfoData;

  if(!isGrp){
    const other=members.find(m=>m.user_id!==ME.id);
    if(other){
      otherProf=other.profiles;
      gcName=other.profiles?.username || 'Chat';
      window._chatOtherId=other.user_id;
    }
  }else{
    if(convoInfo?.group_avatar) gcAvatar=convoInfo.group_avatar;
    if(convoInfo?.group_name) gcName=convoInfo.group_name;
  }

  // ── BLOCK CHECK (1-on-1 chats only) ──
  // Instagram-style: if either party blocked the other, the chat still opens (so the
  // conversation doesn't vanish confusingly) but the input bar is replaced with a
  // "can't message" notice. Existing message history remains visible.
  let chatBlocked = { blocked: false, byMe: false, byThem: false };
  if(!isGrp && window._chatOtherId) {
    try { chatBlocked = await isMessagingBlocked(window._chatOtherId); } catch(e) {}
  }

  const online=otherProf?isOnline(otherProf.last_seen):false;
  const isAdmin=members.find(m=>m.user_id===ME.id)?.is_admin;
  window._chatIsAdmin=isAdmin;
  window._chatGcName=gcName;
  window._chatCid=cid;

  let headerClick = isGrp ? "showGroupInfo('" + cid + "')" : (otherProf ? "goToProfile('" + window._chatOtherId + "')" : '');
  let headerAv = isGrp ? (gcAvatar ? '<div style="width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2px solid rgba(255,255,255,0.08)"><img src="'+gcAvatar+'" style="width:100%;height:100%;object-fit:cover"></div>' : '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#FF2D7A,#833AB4);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+ico('group','#fff',20)+'</div>') : av(otherProf?.avatar_url,otherProf?.username,40,false,online);

  // Premium chat header icons
  let callIcons = isGrp ?
    '<div onclick="showGroupCallTypeMenu(\''+cid+'\')" style="width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s">'+ico('phone','#fff',18)+'</div><div onclick="showGroupInfo(\''+cid+'\')" style="width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s;margin-left:8px">'+ico('more_v','#fff',18)+'</div>'
    :
    '<div onclick="initiateCall(\''+window._chatOtherId+'\',\''+(gcName||'User').replace(/'/g,"\\'")+'\',\''+(otherProf?.avatar_url||'')+'\',\'audio\')" style="width:32px;height:32px;border-radius:10px;background:rgba(255,45,122,0.08);border:1px solid rgba(255,45,122,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s">'+ico('phone','#FF2D7A',16)+'</div><div onclick="initiateCall(\''+window._chatOtherId+'\',\''+(gcName||'User').replace(/'/g,"\\'")+'\',\''+(otherProf?.avatar_url||'')+'\',\'video\')" style="width:32px;height:32px;border-radius:10px;background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s;margin-left:6px">'+ico('video','#00E5FF',16)+'</div><div onclick="showChatActions(\''+cid+'\')" style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s;margin-left:6px">'+ico('more_v','#fff',16)+'</div>';

  let subText = isGrp ? '<div style="color:#8A8A8A;font-size:11px;font-weight:500">'+members.length+' members</div>' : '<div style="color:'+(online?'#3db83d':'#8A8A8A')+';font-size:11px;font-weight:500">'+(online?'Active now':lastSeenText(otherProf?.last_seen))+'</div>';

  let callBannerHtml = '';
  if(convoInfo?.active_call_type) {
    callBannerHtml = '<div id="active-call-banner" style="background:linear-gradient(90deg,#0A0A0A,#1a0533);padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.06);">';
    callBannerHtml += ico(convoInfo.active_call_type === 'video' ? 'video' : 'phone', '#FF2D7A', 18);
    callBannerHtml += '<div style="flex:1;font-size:12px;color:#fff;"><b>'+(convoInfo.active_call_type === 'video' ? 'Video' : 'Audio')+' Call</b><br><span style="color:#8A8A8A;">'+(convoInfo.active_call_by === ME.id ? 'You started' : 'In progress')+'</span></div>';
    callBannerHtml += '<button onclick="endCall()" style="background:#FF2D7A;border:none;color:#fff;font-weight:700;padding:6px 14px;border-radius:10px;font-size:12px;cursor:pointer;">End</button>';
    callBannerHtml += '<button style="background:#3db83d;border:none;color:#000;font-weight:700;padding:6px 14px;border-radius:10px;font-size:12px;cursor:pointer;">Join</button>';
    callBannerHtml += '</div>';
  }

  let pinBarHtml = convoInfo?.pinned_message_text ? '<div id="pin-bar" style="padding:8px 14px;background:#0A0A0A;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;cursor:pointer;color:#fff;display:flex;align-items:center;gap:8px">'+ico('star','#FF2D7A',14)+' '+esc(convoInfo.pinned_message_text)+'</div>' : ''; // XSS H8: escape pinned text from DB (plain text only — no linkify on this path)

  // Premium chat header
  let htmlArr = [];
  htmlArr.push('<div style="display:flex;flex-direction:column;height:100%;position:relative;">');
  // Premium topbar with glassmorphism
  htmlArr.push('<div class="topbar" style="padding:10px 12px;gap:8px">');
  // Back button - premium
  htmlArr.push('<div onclick="pauseAllVideos();goBack()" style="width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s;flex-shrink:0">'+ico('back','#fff',18)+'</div>');
  // Avatar + Name (clickable)
  htmlArr.push('<div onclick="'+headerClick+'" style="cursor:pointer;display:flex;align-items:center;gap:10px;flex:1;min-width:0">');
  htmlArr.push(headerAv);
  htmlArr.push('<div style="min-width:0"><div style="font-weight:700;font-size:15px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+gcName+'</div>'+subText+'</div>');
  htmlArr.push('</div>');
  // Action icons
  htmlArr.push('<div onclick="searchMessages(\''+cid+'\')" style="width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s;flex-shrink:0">'+ico('search','#fff',18)+'</div>');
  // Call icons
  htmlArr.push('<div style="display:flex;gap:0;flex-shrink:0">');
  htmlArr.push(callIcons);
  htmlArr.push('</div>');
  htmlArr.push('</div>'); // topbar end

  htmlArr.push(pinBarHtml);
  htmlArr.push(callBannerHtml);
  htmlArr.push('<div id="typing-indicator" style="padding:4px 14px;font-size:12px;color:#888;display:none;">Typing...</div>');
  htmlArr.push('<div id="mlist" style="flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:8px;-webkit-overflow-scrolling:touch"></div>');

  // Scroll to Bottom Button (Premium Feature)
  htmlArr.push('<div id="scroll-down-btn" onclick="document.getElementById(\'mlist\').scrollTop=document.getElementById(\'mlist\').scrollHeight" style="position:absolute;bottom:70px;right:20px;background:#333;width:36px;height:36px;border-radius:50%;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:10;box-shadow:0 2px 8px rgba(0,0,0,0.5);">'+ico('back','#fff',20)+'</div>');

  htmlArr.push('<div id="reply-preview" style="display:none;padding:8px 14px;background:#111;border-top:1px solid #222"></div>');

  // Input Bar — OR — Blocked-state notice (Instagram-style: chat history stays visible,
  // but new messages can't be sent when either party has blocked the other)
  if(!isGrp && chatBlocked.blocked) {
    // ── BLOCKED: replace input bar with a non-interactive notice ──
    // Message wording mirrors Instagram: "You can't message this user" (works for both
    // I-blocked-them and they-blocked-me scenarios — the user doesn't need to know which).
    htmlArr.push('<div class="chat-input-wrap" style="justify-content:center">');
    htmlArr.push('<div style="flex:1;text-align:center;padding:14px 20px;color:#888;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px">'+ico('lock','#666',16)+' <span style="vertical-align:middle;margin-left:4px">You can\'t message this user</span></div>');
    htmlArr.push('</div>');
  } else {
    // Next-Gen Input Bar
  htmlArr.push('<div class="chat-input-wrap">');

  // Left Plus Button
  htmlArr.push('<div class="plus-btn-chat" onclick="toggleAttachmentSheet(\''+cid+'\')" style="color:#fff">'+ico('plus','#fff',24)+'</div>');

  // Main Pill
  htmlArr.push('<div class="chat-pill">');
  // DM DRAFT: restore saved draft for this conversation
  var _draftText = '';
  try { var _drafts = JSON.parse(localStorage.getItem('nova-dm-drafts') || '{}'); _draftText = _drafts[cid] || ''; } catch(e) {}
  htmlArr.push('<textarea id="minp" rows="1" placeholder="Message..." onfocus="this.parentElement.classList.add(\'expanded\')" onblur="if(!this.value.trim())this.parentElement.classList.remove(\'expanded\'); saveDmDraft(\''+cid+'\', this.value)" oninput="autoGrow(this); toggleSendBtn(); checkMention(this, \''+cid+'\'); saveDmDraft(\''+cid+'\', this.value)" onkeydown="if(event.key===\'Enter\' && !event.shiftKey){event.preventDefault(); sendMsg(\''+cid+'\')}" class="chat-textarea">'+_draftText+'</textarea>');
   // Emoji Button inside Pill
  htmlArr.push('<div onclick="openStickerPicker(\''+cid+'\')" style="cursor:pointer; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:24px; color:#aaa; flex-shrink:0;">😊</div>');
  htmlArr.push('</div>'); // chat-pill end

  // Right Dynamic Icons
  htmlArr.push('<div class="right-icons-chat">');
  // Camera
  htmlArr.push('<div id="cam-icon" class="icon-morph" onclick="document.getElementById(\'dm-cam-pick\').click()">'+ico('cam','#fff',0)+'</div>');
  // Mic
    htmlArr.push('<div id="mic-btn" class="icon-morph" onclick="toggleRecording(\''+cid+'\')">'+ico('mic','#fff',24)+'</div>');
  // Send
  htmlArr.push('<div id="send-icon" class="icon-morph icon-hidden" onclick="haptic(15); sendMsg(\''+cid+'\')"><div class="send-btn-chat">'+ico('send','#fff',20)+'</div></div>');
  htmlArr.push('</div>'); // right-icons-chat end

  htmlArr.push('</div>'); // chat-input-wrap end
  } // end else (not blocked)

  // A tab switch/back action may have invalidated this async open while the
  // member/conversation queries were in flight. Never paint stale chat DOM.
  if (chatGeneration !== _renderGeneration || !window._chatScreenActive) return;

  scr.style.opacity="0.95";

  console.log("Rendering input bar");
  console.log("Screen rendered");
  scr.innerHTML = htmlArr.join('');

  loadMsgs(cid,isGrp);
  startTypingWatcher(cid);

  // Scroll Event for Scroll-to-Bottom Button
  const mlist = document.getElementById('mlist');
  const scrollBtn = document.getElementById('scroll-down-btn');
  if(mlist && scrollBtn) {
    mlist.onscroll = () => {
      if(mlist.scrollTop < mlist.scrollHeight - mlist.clientHeight - 200) {
        scrollBtn.style.display = 'flex';
      } else {
        scrollBtn.style.display = 'none';
      }
    };
  }

  if(window.chatSubscription){ db.removeChannel(window.chatSubscription); }
  window.chatSubscription = db.channel('chat-' + cid).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},(payload) => {
    if(payload.new.conversation_id !== cid) return;

    // ── Part 9 Fix 2.1: Smart realtime handler — don't destroy pagination history ──
    // If user is near the bottom (within 150px), safe to full-reload (they're looking at latest).
    // If user has scrolled UP to browse history, DON'T reload (would destroy loaded older messages + snap to bottom).
    // Instead, show a "New message ↓" pill they can tap to jump to latest.
    const list = document.getElementById('mlist');
    if(!list){
      loadMsgs(cid, isGrp); // fallback if list not in DOM
      return;
    }

    const distFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    const isNearBottom = distFromBottom < 150;

    if(isNearBottom){
      // User is at/near bottom — full reload is safe, keeps them at latest
      loadMsgs(cid, isGrp);
    } else {
      // User is browsing history — DON'T destroy loaded messages.
      // Show a "New message ↓" pill instead. Tapping it loads fresh + scrolls to bottom.
      _showNewMessagePill(cid, isGrp, list);
    }
  }).subscribe();
};
