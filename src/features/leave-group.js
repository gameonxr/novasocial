// leaveGroup — extracted from index.html
// Owner SHA-256: 3ac2e490b6017770576a62574da3db53127b3bf89117a8d765e9416328596580
// Classic script — exposes window.leaveGroup

window.leaveGroup = async function leaveGroup(cid){
  if(!confirm('Group chhod doge?'))return;
  await db.from('conversation_members').delete().eq('conversation_id',cid).eq('user_id',ME.id);
  try {
    await db.from('messages').insert({conversation_id:cid,sender_id:ME.id,text:`👋 ${PROF.username||'Someone'} left the group`}).throwOnError();
  } catch(e) {
    console.warn('Group system message send failed (non-critical, action already done):', e);
  }
  closeModal();go('dms');toast('Group chhod diya');
};
