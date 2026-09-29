// adminDemoteUser — extracted from index.html
// Owner SHA-256: 4bb5411f56adf1490928c98b12e1711c5c84d0666ea0b48399ec00dbb4f764e0
// Classic script — exposes window.adminDemoteUser

window.adminDemoteUser = async function adminDemoteUser(userId, username){
  if(!PROF?.is_super_admin){
    toast('❌ Only super admin can demote other admins');
    return;
  }
  if(!confirm(`Remove admin privileges from "${username}"?\n\nThey will lose all admin access.`)) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('demote_user', {
      p_target_id: userId,
      p_new_role: 'user',
      p_reason: 'Demoted via admin panel'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `⚠️ Your admin privileges have been removed.`);
    toast(`✅ ${username} is no longer admin`); closeModal();
    setTimeout(()=>searchAdminUsers(document.getElementById('admin-user-search')?.value||''),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('SUPER_ADMIN_PROTECTED')) toast('❌ Cannot demote a super admin');
    else if(msg.includes('PERMISSION_DENIED')) toast('❌ Only super admin can demote users');
    else toast('❌ Failed: ' + msg);
  }
};
