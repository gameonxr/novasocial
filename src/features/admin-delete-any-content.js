// adminDeleteAnyContent — extracted from index.html
// Owner SHA-256: 91c290dc235f0f233a0147daacfcaa8a2f792f85f77345be931f9420465f22a0
// Classic script — exposes window.adminDeleteAnyContent

window.adminDeleteAnyContent = async function adminDeleteAnyContent(contentId, type, username, userId){
  const reason = prompt(`Delete this ${type}?\n\nReason (required):`);
  if(!reason || !reason.trim()) return;
  try {
    // 🔒 SECURE RPC CALL — server verifies manage_content permission
    // Map table names to content types for the RPC
    let rpcType = type;
    if(type === 'posts') rpcType = 'post';
    else if(type === 'comments') rpcType = 'comment';
    else if(type === 'stories') rpcType = 'story';
    const { error } = await db.rpc('delete_content', {
      p_content_type: rpcType,
      p_content_id: contentId,
      p_reason: reason.trim()
    });
    if(error) throw error;
    if(userId) await sendAdminNotification(userId, `🗑️ Your ${type} has been removed by an admin for violating community guidelines. Reason: ${reason.trim()}`);
    toast(`✅ ${type} deleted`);
    await loadAdminContent(_contentType);
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ You do not have permission to delete content');
    else if(msg.includes('INVALID_CONTENT_TYPE')) toast('❌ Invalid content type');
    else toast('❌ Delete failed: ' + msg);
  }
};
