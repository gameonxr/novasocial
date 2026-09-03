// sendNotif — extracted from index.html
// Owner SHA-256: debb057e3ceda8d3db3f07a0de816128c31c234b1189502a23b42bef886fbf3c
// Classic script — exposes window.sendNotif

window.sendNotif = async function sendNotif(recipientId, type, extra){
  extra = extra || {};
  if(!recipientId || recipientId === ME.id) return;

  try{
    const{data:blocked}=await db.from('blocks').select('id').eq('blocker_id',recipientId).eq('blocked_id',ME.id).maybeSingle();
    if(blocked) return;
  }catch(e){}

  const prefCol = NOTIF_PREF_MAP[type];
  if(prefCol){
    try{
      const{data:wants}=await db.rpc('user_wants_notif',{target_user_id:recipientId,pref_column:prefCol});
      if(wants === false) return;
    }catch(e){}
  }

  try{
    await db.from('notifications').insert({
      recipient_id: recipientId,
      sender_id: ME.id,
      type: type,
      post_id: extra.post_id || null,
      comment_id: extra.comment_id || null,
      conversation_id: extra.conversation_id || null,
      story_id: extra.story_id || null,
      message: extra.message || ''
    });
  }catch(e){ console.error('sendNotif failed:', e); }
};
