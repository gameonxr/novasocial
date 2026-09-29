// adminPromoteUser — extracted from index.html
// Owner SHA-256: f11abb84dd5309e9f7db4484158a339d44ef142e9c52e69a9bdfab6e5df8e7e6
// Classic script — exposes window.adminPromoteUser

window.adminPromoteUser = async function adminPromoteUser(userId, username){
  if(!PROF?.is_super_admin){
    toast('❌ Only super admin can promote users to admin');
    return;
  }
  if(!confirm(`Promote "${username}" to admin?\n\nThis gives them FULL admin access.\n\nNote: They CANNOT demote or ban you (super admin protection).`)) return;
  try {
    // 🔒 SECURE RPC CALL — server verifies caller is super_admin
    const { error } = await db.rpc('promote_user', {
      p_target_id: userId,
      p_new_role: 'admin',
      p_reason: 'Promoted via admin panel'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `🎉 You have been promoted to admin. Open Settings → Admin Panel to access moderation tools.`);
    toast(`✅ ${username} is now admin`); closeModal();
    setTimeout(()=>searchAdminUsers(document.getElementById('admin-user-search')?.value||''),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ Only super admin can promote users');
    else if(msg.includes('PROTECTED')) toast('❌ Cannot modify an existing super admin');
    else toast('❌ Failed: ' + msg);
  }
};
