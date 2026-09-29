// stickerSend — extracted from index.html
// Owner SHA-256: 33e8a31967de28883f062e39e3c0249c6f5afaff35761e6aa70cb461a8e6f3c7
// Classic script — exposes window.stickerSend

window.stickerSend = async function stickerSend(idx) {
  const url = (window._stickerUrls || [])[idx];
  if(!url) return;
  let recents = JSON.parse(localStorage.getItem('recent_stickers') || '[]');
  recents = [url, ...recents.filter(u => u !== url)];
  if(recents.length > 20) recents.pop();
  localStorage.setItem('recent_stickers', JSON.stringify(recents));
  try {
    await db.from('messages').insert({ conversation_id: window._stickerCid, sender_id: ME.id, text: '', media_url: url, media_type: 'image' }).throwOnError();
  } catch(e) {
    if (e.message?.includes('MESSAGING_BLOCKED')) {
      toast("You can't send messages to this user");
    } else {
      console.error('Sticker send failed:', e);
      toast('Sticker send nahi hua 😕');
    }
    return;
  }
  closeModal();
  loadMsgs(window._stickerCid, window._curIsGrp);
};
