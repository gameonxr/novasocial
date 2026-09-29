// sendStoryReply — extracted from index.html
// Owner SHA-256: d10177eca3012ec04a067b86e9650665312dd29a1f78b442d039d9d54d742d14
// Classic script — exposes window.sendStoryReply

window.sendStoryReply = async function sendStoryReply(uid, txt, storyId) {
  const{data:myConvos}=await db.from('conversation_members').select('conversation_id,conversations!inner(is_group)').eq('user_id',ME.id);
  const oneOnOneIds=(myConvos||[]).filter(c=>!c.conversations.is_group).map(c=>c.conversation_id);
  if(oneOnOneIds.length){
    const{data:existing}=await db.from('conversation_members').select('conversation_id').eq('user_id',uid).in('conversation_id',oneOnOneIds);
    if(existing?.length){
      try {
        await db.from('messages').insert({conversation_id:existing[0].conversation_id, sender_id:ME.id, text:'📸 Replied to story: ' + txt}).throwOnError();
      } catch(e) {
        if (e.message?.includes('MESSAGING_BLOCKED')) {
          toast("You can't send messages to this user");
        } else {
          console.error('Story reply send failed:', e);
          toast('Reply send nahi hua 😕');
        }
        return;
      }
      try { await sendNotif(uid, 'story_reply', {message: 'replied to your story: '+txt.slice(0,40), story_id: storyId}); } catch(e) {}
      return;
    }
  }
  const{data:c}=await db.from('conversations').insert({is_group:false,created_by:ME.id}).select().single();
  if(c){
    await Promise.all([
      db.from('conversation_members').insert({conversation_id:c.id,user_id:ME.id}),
      db.from('conversation_members').insert({conversation_id:c.id,user_id:uid})
    ]);
    try {
      await db.from('messages').insert({conversation_id:c.id, sender_id:ME.id, text:'📸 Replied to story: ' + txt}).throwOnError();
    } catch(e) {
      if (e.message?.includes('MESSAGING_BLOCKED')) {
        toast("You can't send messages to this user");
      } else {
        console.error('Story reply send failed:', e);
        toast('Reply send nahi hua 😕');
      }
      return;
    }
    try { await sendNotif(uid, 'story_reply', {message: 'replied to your story: '+txt.slice(0,40), story_id: storyId}); } catch(e) {}
  }
};
