// adminPromoteModerator — extracted from index.html
// Owner SHA-256: 8912c041082f9a27bd9785c0e50fda82ef15dfccbc617749ecc49972117edd31
// Classic script — exposes window.adminPromoteModerator

window.adminPromoteModerator = async function adminPromoteModerator(userId, username){
  if(!confirm(`Promote "${username}" to Moderator?\n\nModerators can:\n• View reports\n• Recommend bans (need admin approval)\n\nModerators CANNOT:\n• Ban users directly\n• Delete content\n• Promote/demote anyone`)) return;
  try {
    // 🔒 SECURE RPC CALL — only super_admin can promote (enforced server-side)
    const { error } = await db.rpc('promote_user', {
      p_target_id: userId,
      p_new_role: 'moderator',
      p_reason: 'Promoted to moderator via admin panel'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `🎉 You have been promoted to Moderator. You can view reports and recommend bans. Open Settings → Admin Panel.`);
    toast(`✅ ${username} is now a moderator`);
    closeModal();
    setTimeout(()=>loadTeamList(),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ Only super admin can promote users');
    else toast('❌ Failed: ' + msg);
  }
};
