// pinMsg — extracted from index.html
// Owner SHA-256: b6a2229f7800fa8426497977a884246c92fd67aa184e58a7c4269995fbee9283
// Classic script — exposes window.pinMsg

window.pinMsg = async function pinMsg(mid,text){
  const {data,error} = await db.from('conversations').update({pinned_message_id: mid, pinned_message_text: text}).eq('id', window._curChatId);
  toast('Message pinned 📌');
  const pinBar=document.getElementById('pin-bar');
  if(pinBar){ pinBar.innerHTML='📌 ' + text; pinBar.style.display='block'; }
  const box=document.getElementById('react-box');
  if(box) box.remove();
  // Part 9 Fix 2.2: removed loadMsgs() call — pin bar already updated above.
  // No need to reload entire message list just for a pin update.
};
