// sendMediaMsg — extracted from index.html
// Owner SHA-256: 78363724f6bbef531b4961d74b53efd1c19ef5825cc95e428265e8684aa625d0
// Classic script — exposes window.sendMediaMsg

window.sendMediaMsg = async function sendMediaMsg(cid, inp) {
  const f = inp.files[0];
  if(!f) return;
  inp.value = '';
  toast('Uploading media...');
  try {
    const url = await upload(f, null, 'chat');
    const mType = f.type.startsWith('video/') ? 'video' : 'image';
    await db.from('messages').insert({
      conversation_id: cid,
      sender_id: ME.id,
      text: '',
      media_url: url,
      media_type: mType
    }).throwOnError();
    // Part 9 Fix 2.3: removed loadMsgs() — realtime handler will pick up this INSERT.
    // If user is at bottom (likely, just sent), isNearBottom=true → reload fires cleanly.
    // If scrolled up, "New message ↓" pill appears (non-destructive).
  } catch(e) {
    if (e.message?.includes('MESSAGING_BLOCKED')) {
      toast("You can't send messages to this user");
    } else {
      console.error('Media send failed:', e);
      toast('Media upload failed');
    }
  }
};
