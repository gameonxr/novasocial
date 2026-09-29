// adminBanMsgUser — extracted from index.html
// Owner SHA-256: 45dd94cb1c8a102cf5447045ca6e29b1f3ba62c72fabe5dbca3c163170c9b0df
// Classic script — exposes window.adminBanMsgUser

window.adminBanMsgUser = async function adminBanMsgUser(userId, username){
  const reason = prompt(`Ban "${username}" from sending messages?\n\nThey can still browse but can't send DM/GC text.\n\nReason:`);
  if(!reason||!reason.trim()) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('msg_ban_user', {
      p_target_id: userId,
      p_reason: reason.trim()
    });
    if(error) throw error;
    await sendAdminNotification(userId, `🚫 You have been restricted from sending messages. Reason: ${reason.trim()}. You can still browse the app.`);
    toast(`✅ ${username} can no longer send messages`); closeModal();
    setTimeout(()=>searchAdminUsers(document.getElementById('admin-user-search')?.value||''),300);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PROTECTED_ACCOUNT')) toast('❌ Cannot restrict a protected account');
    else if(msg.includes('PERMISSION_DENIED')) toast('❌ Permission denied');
    else toast('❌ Failed: ' + msg);
  }
};
