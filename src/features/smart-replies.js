/**
 * NovaSocial Smart Replies helper.
 *
 * Extracted as a classic script so inline chat suggestion controls remain
 * window-global while core DMs/realtime behavior stays in index.html.
 */
// SMART REPLY SUGGESTIONS IN CHAT (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
function getSmartReplies(lastMsg){
  const t = (lastMsg||'').toLowerCase();
  if(t.match(/^(hi|hello|hey|namaste|hola)/)) return ['Hey! 😄','Hi there! 👋','Hello! Kaise ho?'];
  if(t.match(/how are you|kaise ho|kya haal/)) return ['Mast hu, tu bata? 😄','All good! Tera kya haal?','Ekdum fit fat! 💪'];
  if(t.match(/thank|shukriya|dhanyavad/)) return ['Koi baat nahi! 😊','Anytime! 🤝','My pleasure! ✨'];
  if(t.match(/bye|tata|alvida|see you/)) return ['Bye! 👋','Milte hain phir! 🤝','Take care! ❤️'];
  if(t.match(/\?$/)) return ['Hmm, sochta hu 🤔','Pata nahi yaar 😅','Haan bilkul! ✨'];
  if(t.match(/love|mohabbat|pyar/)) return ['Awww 🥰','Same here ❤️','💕💕'];
  if(t.match(/food|khana|lunch|dinner/)) return ['Bhookh lagi! 🍕','Kha lenge kahin?','Yum! 😋'];
  return ['Interesting! 🤔','Tell me more 👀','Haha 😄','Sounds good! 👍','Hmm 🤔'];
}

function showSmartReplies(cid, lastMsg){
  const replies = getSmartReplies(lastMsg);
  if(!replies || !replies.length) return '';
  return `
    <div style="display:flex;gap:6px;padding:8px 12px;overflow-x:auto;scrollbar-width:none">
      ${replies.map(r=>`
        <div onclick="quickSendReply('${cid}','${r.replace(/'/g,"\\'")}')" style="flex-shrink:0;padding:8px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:18px;font-size:13px;color:#fff;cursor:pointer">${r}</div>
      `).join('')}
    </div>
  `;
}

function quickSendReply(cid, text){
  const inp = document.getElementById('cinp');
  if(inp){
    inp.value = text;
    sendMsg(cid);
  }
}

// ═══════════════════════════════════════════════════════════════════════
