// adminDemoteModerator — extracted from index.html
// Owner SHA-256: 8c9c3e1bcf72a01aa83edbc697bfda0a1a6b18d45a17db359621eaa12e1845b7
// Classic script — exposes window.adminDemoteModerator

window.adminDemoteModerator = async function adminDemoteModerator(userId, username){
  if(!confirm(`Remove moderator from "${username}"?`)) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('demote_user', {
      p_target_id: userId,
      p_new_role: 'user',
      p_reason: 'Removed moderator via admin panel'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `⚠️ Your moderator privileges have been removed.`);
    toast(`✅ ${username} is no longer moderator`);
    closeModal();
    setTimeout(()=>loadTeamList(),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ Only super admin can demote users');
    else if(msg.includes('SUPER_ADMIN_PROTECTED')) toast('❌ Cannot demote a super admin');
    else toast('❌ Failed: ' + msg);
  }
};
