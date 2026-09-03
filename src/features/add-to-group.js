// addToGroup — extracted from index.html
// Owner SHA-256: 185fe84235ae0de3f565163eeca1945c37a513fad82ef7887635b8e09c289355
// Classic script — exposes window.addToGroup

window.addToGroup = async function addToGroup(cid,uid,uname,btn){
  try{
    await db.from('conversation_members').insert({conversation_id:cid,user_id:uid,is_admin:false});
    try {
      await db.from('messages').insert({conversation_id:cid,sender_id:ME.id,text:`✅ ${uname} was added to the group`}).throwOnError();
    } catch(msgErr) {
      console.warn('Group system message send failed (non-critical, member already added):', msgErr);
    }
    const{data:grpInfo}=await db.from('conversations').select('name').eq('id',cid).single();
    try { await sendNotif(uid, 'group_invite', {message: 'added you to '+((grpInfo && grpInfo.name) || 'a group'), conversation_id: cid}); } catch(e) {}
    toast(`${uname} added! 🎉`);
    btn.textContent='Added ✓';btn.disabled=true;btn.style.opacity='0.5';
    const{data:mems}=await db.from('conversation_members').select('user_id,is_admin,profiles!conversation_members_user_id_fkey(username,avatar_url,last_seen)').eq('conversation_id',cid);
    window._chatMembers=mems||[];
  }catch(e){toast('Error: '+e.message);}
};
