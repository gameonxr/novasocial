// adminUnbanUser — extracted from index.html
// Owner SHA-256: e7d047410450ed7201fc5314ada58d4be616ac47d3d2cf0525552bdeaab1c09e
// Classic script — exposes window.adminUnbanUser

window.adminUnbanUser = async function adminUnbanUser(userId, username){
  if(!confirm(`Unban "${username}"?`)) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('unban_user', {
      p_target_id: userId,
      p_reason: 'Unbanned via admin panel'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `✅ Your account has been unbanned. You can use NovaSocial again.`);
    toast(`✅ ${username} unbanned`); closeModal();
    setTimeout(()=>searchAdminUsers(document.getElementById('admin-user-search')?.value||''),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PROTECTED_ACCOUNT')) toast('❌ Cannot unban a protected account');
    else if(msg.includes('PERMISSION_DENIED')) toast('❌ Permission denied');
    else toast('❌ Unban failed: ' + msg);
  }
};
