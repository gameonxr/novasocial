// uploadCustomSticker — extracted from index.html
// Owner SHA-256: ccb0e765a8513ff2251c606984a7164982a96cfa53be5d211a478d17cfe6c624
// Classic script — exposes window.uploadCustomSticker

window.uploadCustomSticker = async function uploadCustomSticker(inp, cid) {
  const f = inp.files[0]; if(!f) return; closeModal(); toast('Uploading sticker...');
  try {
    const url = await upload(f, null, 'sticker');
    let recents = getLocalStickers('recent');
    if(!recents.includes(url)) {
      recents.unshift(url);
      if(recents.length > 20) recents.pop();
      localStorage.setItem('recent_stickers', JSON.stringify(recents));
    }
    await db.from('messages').insert({ conversation_id: cid, sender_id: ME.id, text: '', media_url: url, media_type: 'image' }).throwOnError();
    toast('Sticker sent! 🎉');
  } catch(e) {
    if (e.message?.includes('MESSAGING_BLOCKED')) {
      toast("You can't send messages to this user");
    } else {
      console.error('Custom sticker send failed:', e);
      toast('Upload failed');
    }
  }
};
