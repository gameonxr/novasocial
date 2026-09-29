// removeAdmin — extracted from index.html
// Owner SHA-256: d391212d17cae620e5664ac94bf45de11327e12b188b6fc3f75a502673d3d17c
// Classic script — exposes window.removeAdmin

window.removeAdmin = async function removeAdmin(cid, uid) {
  await db.from('conversation_members').update({is_admin:false}).eq('conversation_id',cid).eq('user_id',uid);
  try {
    await db.from('messages').insert({conversation_id:cid, sender_id:ME.id, text:`👤 ${PROF.username} removed an admin`}).throwOnError();
  } catch(e) {
    console.warn('Group system message send failed (non-critical, action already done):', e);
  }
  let m = window._chatMembers?.find(x => x.user_id === uid);
  if(m) m.is_admin = false;

  // Instant DOM Update
  const row = document.getElementById('member-'+uid);
  if(row) {
    const btn = row.querySelector('.admin-btn');
    const role = row.querySelector('.member-role');
    if(btn) { btn.textContent = 'Admin'; btn.setAttribute('onclick', `makeAdmin('${cid}','${uid}')`); }
    if(role) role.innerHTML = '<div style="color:#555;font-size:11px">Member</div>';
  }
};
