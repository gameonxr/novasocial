// Extracted from index.html during Phase 80.
async function startDM(uid){
  closeModal();
  const{data:myConvos}=await db.from('conversation_members').select('conversation_id,conversations!inner(is_group)').eq('user_id',ME.id);
  const oneOnOneIds=(myConvos||[]).filter(c=>!c.conversations.is_group).map(c=>c.conversation_id);
  if(oneOnOneIds.length){
    const{data:existing}=await db.from('conversation_members').select('conversation_id').eq('user_id',uid).in('conversation_id',oneOnOneIds);
    if(existing?.length){openChat(existing[0].conversation_id,'Chat',false);return;}
  }
  const{data:c}=await db.from('conversations').insert({is_group:false,created_by:ME.id}).select().single();
  if(c){
    await Promise.all([db.from('conversation_members').insert({conversation_id:c.id,user_id:ME.id}),db.from('conversation_members').insert({conversation_id:c.id,user_id:uid})]);
    openChat(c.id,'Chat',false);
  }
}
