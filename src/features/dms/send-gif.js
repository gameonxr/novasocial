// sendGif — extracted from index.html
// Owner SHA-256: b94adc0ac9a308fcc13ff9d87c44c7d159a93622994d635ddc48e9486fab851c
// Classic script — exposes window.sendGif

window.sendGif = async function sendGif(img) {
  const url = img.getAttribute('data-url') || img.src;
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
      console.error('GIF send failed:', e);
      toast('GIF send nahi hua 😕');
    }
    return;
  }
  closeModal();
  loadMsgs(window._stickerCid, window._curIsGrp);
};
