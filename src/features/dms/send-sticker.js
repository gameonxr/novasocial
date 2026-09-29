// sendSticker — extracted from index.html
// Owner SHA-256: 816d050434681dbdf9708b3878019b700538a855f2f3235205451fef47c30e71
// Classic script — exposes window.sendSticker

window.sendSticker = async function sendSticker(cid, emoji) {
  try {
    await db.from('messages').insert({ conversation_id: cid, sender_id: ME.id, text: emoji }).throwOnError();
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
};
