// Note reply submission helper.
async function sendNoteReply(noteId, noteOwnerId){
  const inp = document.getElementById('note-reply-inp');
  const txt = inp?.value?.trim();
  if(!txt) return;
  inp.value='';
  try{
    const{data:myConvos}=await db.from('conversation_members').select('conversation_id,conversations!inner(is_group)').eq('user_id',ME.id);
    const oneOnOneIds=(myConvos||[]).filter(c=>!c.conversations.is_group).map(c=>c.conversation_id);
    let cid=null;
    if(oneOnOneIds.length){
      const{data:existing}=await db.from('conversation_members').select('conversation_id').eq('user_id',noteOwnerId).in('conversation_id',oneOnOneIds);
      if(existing?.length) cid=existing[0].conversation_id;
    }
    if(!cid){
      const{data:c}=await db.from('conversations').insert({is_group:false,created_by:ME.id}).select().single();
      if(c){ cid=c.id;
        await Promise.all([
          db.from('conversation_members').insert({conversation_id:cid,user_id:ME.id}),
          db.from('conversation_members').insert({conversation_id:cid,user_id:noteOwnerId})
        ]);
      }
    }
    if(cid){
      try {
        await db.from('messages').insert({conversation_id:cid, sender_id:ME.id, text:`💭 Replied to your note: ${txt}`}).throwOnError();
        toast('Reply sent! 💬');
        document.getElementById('note-view-overlay')?.remove();
      } catch(msgErr) {
        if (msgErr.message?.includes('MESSAGING_BLOCKED')) {
          toast("You can't send messages to this user");
        } else {
          console.error('Note reply send failed:', msgErr);
          toast('Reply failed');
        }
      }
    }
  }catch(e){ toast('Reply failed'); }
}
