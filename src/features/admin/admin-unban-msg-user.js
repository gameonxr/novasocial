// adminUnbanMsgUser — extracted from index.html
// Owner SHA-256: bfe3ac9742a8099d1162706795edb636f4cbc67ee5ebbd793a244db4a49f92f4
// Classic script — exposes window.adminUnbanMsgUser

window.adminUnbanMsgUser = async function adminUnbanMsgUser(userId, username){
  if(!confirm(`Restore messaging for "${username}"?`)) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('msg_unban_user', {
      p_target_id: userId,
      p_reason: 'Restored via admin panel'
    });
    if(error) throw error;
    await sendAdminNotification(userId, `✅ Your messaging access has been restored.`);
    toast(`✅ ${username} can send messages again`); closeModal();
    setTimeout(()=>searchAdminUsers(document.getElementById('admin-user-search')?.value||''),300);
  } catch(e) { toast('❌ Failed: '+(e.message||'error')); }
};
