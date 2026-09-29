// heartReact — extracted from index.html
// Owner SHA-256: 8cd12edafc0716e412f19667cfbe9fed5aa28c17ee9677adc7c93976625ece6a
// Classic script — exposes window.heartReact

window.heartReact = async function heartReact(mid){
  const {data:old} = await db.from('message_reactions').select('*').eq('message_id',mid).eq('user_id',ME.id).maybeSingle();
  if(old){
    await db.from('message_reactions').delete().eq('id',old.id);
    _updateMessageReactionInPlace(mid); // Part 9 Fix 2.2: in-place update, no list reload
    return;
  }
  await db.from('message_reactions').insert({message_id:mid,user_id:ME.id,emoji:'❤️'});
  _updateMessageReactionInPlace(mid); // Part 9 Fix 2.2: in-place update, no list reload
};
