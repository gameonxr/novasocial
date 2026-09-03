// removeMember — extracted from index.html
// Owner SHA-256: 760ac572965a0f7bcc1f78beb1c8b2857aa2c9e5989b122a41adbc6fc7f9edf1
// Classic script — exposes window.removeMember

window.removeMember = async function removeMember(cid, uid) {
  if(!confirm('Remove this member?')) return;
  const uname = window._chatMembers?.find(m => m.user_id === uid)?.profiles?.username || 'Someone';
  await db.from('conversation_members').delete().eq('conversation_id',cid).eq('user_id',uid);
  try {
    await db.from('messages').insert({conversation_id:cid, sender_id:ME.id, text:`❌ ${PROF.username} removed ${uname}`}).throwOnError();
  } catch(e) {
    console.warn('Group system message send failed (non-critical, action already done):', e);
  }
  window._chatMembers = window._chatMembers.filter(m => m.user_id !== uid);

  // Instant DOM Removal
  const row = document.getElementById('member-'+uid);
  if(row) {
    row.style.transition = '0.3s';
    row.style.opacity = '0';
    row.style.height = '0';
    setTimeout(() => row.remove(), 300);
  }
};
