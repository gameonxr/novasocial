// adminPromoteModToAdmin — extracted from index.html
// Owner SHA-256: ee204fd1b9bb218ad1f7c8cd8b002fcdf7b8c3b7deafb6e4884e0f5501d9c487
// Classic script — exposes window.adminPromoteModToAdmin

window.adminPromoteModToAdmin = async function adminPromoteModToAdmin(userId, username){
  if(!PROF?.is_super_admin){ toast('❌ Only super admin can promote to admin'); return; }
  if(!confirm(`Promote "${username}" from Moderator to ADMIN?\n\nThis gives them full admin access.\n\nNote: They CANNOT demote or ban you (super admin protection).`)) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('promote_user', {
      p_target_id: userId,
      p_new_role: 'admin',
      p_reason: 'Promoted from moderator to admin'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `🎉 You have been promoted to Admin! You now have full admin access.`);
    toast(`✅ ${username} is now an admin`);
    closeModal();
    setTimeout(()=>loadTeamList(),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ Only super admin can promote users');
    else toast('❌ Failed: ' + msg);
  }
};
