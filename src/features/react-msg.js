// reactMsg — extracted from index.html
// Owner SHA-256: 9e142f3563c4ffbe8b96e8e8699f1306fcdc8e1889fdea8837edbe08058f8ca6
// Classic script — exposes window.reactMsg

window.reactMsg = async function reactMsg(mid, emoji) {
  closeModal(); // Close menu instantly
  const {data:old} = await db.from('message_reactions').select('*').eq('message_id',mid).eq('user_id',ME.id).maybeSingle();
  if(old){
    if(old.emoji === emoji){ await db.from('message_reactions').delete().eq('id',old.id); }
    else { await db.from('message_reactions').update({emoji}).eq('id',old.id); }
  } else {
    await db.from('message_reactions').insert({message_id:mid,user_id:ME.id,emoji});
  }
  _updateMessageReactionInPlace(mid); // Part 9 Fix 2.2: in-place update, no list reload
};
