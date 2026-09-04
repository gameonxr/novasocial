// sendMsg — extracted from index.html
// Owner SHA-256: b7e6fdff8225d19607255b123c9aef0b5ed0852fc3500c37c057432e0ed12b06
// Classic script — exposes window.sendMsg

window.sendMsg = async function sendMsg(cid){
  if(isBannedClient()) return;
  if(isMsgBannedClient()) return;
  const inp=document.getElementById('minp');if(!inp)return;
  const txt=inp.value.trim();if(!txt)return;

  // ── BLOCK CHECK (1-on-1 chats only) ──
  // Instagram-style: if either party has blocked the other, no new messages can flow.
  // Group chats are NOT affected (block is a 1-on-1 concept).
  if(window._curChatId === cid && !window._curIsGrp && window._chatOtherId) {
    const blockStatus = await isMessagingBlocked(window._chatOtherId);
    if(blockStatus.blocked) {
      // Don't clear the input — let the user see what they tried to send, matching
      // Instagram's behavior of preserving the typed text when the send is rejected.
      toast('You can\'t send messages to this user');
      return;
    }
  }

  // DM DRAFT: clear draft on send
  clearDmDraft(cid);
  inp.value='';
  const list=document.getElementById('mlist');
  // ── Part 12 Fix: Track optimistic message element for potential rollback on rate-limit ──
  let optimisticDiv = null;
  if(list){
    optimisticDiv = document.createElement('div');
    optimisticDiv.style.cssText='display:flex;justify-content:flex-end;margin-bottom:2px';
    optimisticDiv.innerHTML=`<div class="mme" style="max-width:72%">${txt}<div style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:3px;text-align:right">now</div></div>`;
    list.appendChild(optimisticDiv);list.scrollTop=list.scrollHeight;
  }
    try {
    let msgData = { conversation_id:cid, sender_id:ME.id, text:txt, reply_to:window.replyToId };
    // Agar Vanish Mode on hai, toh 10 minute ki expiry laga do
    if(window._vanishMode) {
      msgData.expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins
    }
    await db.from('messages').insert(msgData).throwOnError();
    cancelReply();
    // @mention detection aur notification
    try {
      const mentionMatches = txt.match(/@([a-zA-Z0-9_.]+)/g);
      if (mentionMatches && mentionMatches.length) {
        const usernames = [...new Set(mentionMatches.map(m => m.substring(1)))];
        const { data: mentionedUsers } = await db.from('profiles')
          .select('id, username').in('username', usernames);
        if (mentionedUsers?.length) {
          for (const u of mentionedUsers) {
            if (u.id === ME.id) continue;
            await sendNotif(u.id, 'mention', { message: 'mentioned you in a chat', conversation_id: cid });
          }
        }
      }
    } catch(e) { console.error('Chat mention notif error:', e); }
  } catch(e) {
    // Part 12 Fix: Handle server-side rate-limit errors with friendly message + rollback optimistic UI
    if(e.message?.includes('RATE_LIMIT_EXCEEDED')) {
      const friendlyMsg = e.message.split('RATE_LIMIT_EXCEEDED:')[1]?.trim() || 'You are sending messages too fast. Please wait a moment.';
      toast(friendlyMsg);
    } else if (e.message?.includes('MESSAGING_BLOCKED')) {
      // Defensive backstop: client-side isMessagingBlocked() pre-check should catch this,
      // but if it ever gets out of sync with server, the SQL trigger's MESSAGING_BLOCKED
      // error surfaces here. Same friendly message as the pre-check.
      toast("You can't send messages to this user");
    } else {
      toast('Message send nahi hua 😕');
    }
    // Remove the optimistically-appended message since insert failed
    if(optimisticDiv && optimisticDiv.parentNode) {
      optimisticDiv.parentNode.removeChild(optimisticDiv);
    }
  }
  // Part 9 Fix 2.3: removed loadMsgs() call — message already appended optimistically above.
  // Realtime subscription on THIS user's device will also fire (own INSERT triggers
  // the realtime handler), but since user is at bottom (just sent), isNearBottom=true
  // and loadMsgs will fire from there — giving proper render with profile data.
  // Net effect: if user is scrolled up, their position is preserved + message appended.
  // If at bottom, realtime handler reloads cleanly (as before).
};
