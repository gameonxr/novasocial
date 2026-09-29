// makeAdmin — extracted from index.html
// Owner SHA-256: 3623113bca0b27cc617111a1e54e7256915e9ebe8abffd3605ef6c8b3e875e34
// Classic script — exposes window.makeAdmin

window.makeAdmin = async function makeAdmin(cid, uid) {
  await db.from('conversation_members').update({is_admin:true}).eq('conversation_id',cid).eq('user_id',uid);
  try {
    await db.from('messages').insert({conversation_id:cid, sender_id:ME.id, text:`👑 ${PROF.username} made an admin`}).throwOnError();
  } catch(e) {
    console.warn('Group system message send failed (non-critical, action already done):', e);
  }
  let m = window._chatMembers?.find(x => x.user_id === uid);
  if(m) m.is_admin = true;

  // Instant DOM Update
  const row = document.getElementById('member-'+uid);
  if(row) {
    const btn = row.querySelector('.admin-btn');
    const role = row.querySelector('.member-role');
    if(btn) { btn.textContent = 'Remove Admin'; btn.setAttribute('onclick', `removeAdmin('${cid}','${uid}')`); }
    if(role) role.innerHTML = '<div style="color:#E1306C;font-size:11px;font-weight:700;display:flex;align-items:center;gap:3px">'+ico('star','#E1306C',10)+'Admin</div>';
  }
};
