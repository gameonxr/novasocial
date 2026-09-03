// adminDemoteToModerator — extracted from index.html
// Owner SHA-256: 2adca3b7412957e3fb5c9bd33bd5945d71005d2a91830c2a2ba77a18ab91ce4a
// Classic script — exposes window.adminDemoteToModerator

window.adminDemoteToModerator = async function adminDemoteToModerator(userId, username){
  if(!PROF?.is_super_admin){ toast('❌ Only super admin can demote admins'); return; }
  if(!confirm(`Demote "${username}" from Admin to Moderator?\n\nThey will lose admin access but keep moderator access.`)) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('demote_user', {
      p_target_id: userId,
      p_new_role: 'moderator',
      p_reason: 'Demoted from admin to moderator'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `⚠️ You have been demoted from Admin to Moderator. Your access is now limited.`);
    toast(`✅ ${username} is now a moderator`);
    closeModal();
    setTimeout(()=>loadTeamList(),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ Only super admin can demote users');
    else if(msg.includes('SUPER_ADMIN_PROTECTED')) toast('❌ Cannot demote a super admin');
    else toast('❌ Failed: ' + msg);
  }
};
