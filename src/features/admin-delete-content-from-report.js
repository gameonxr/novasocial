// adminDeleteContentFromReport — extracted from index.html
// Owner SHA-256: 0721c1748e1bb86fa7ce70ca21ceb1497a2f330e1513600aeb8f0a0197184675
// Classic script — exposes window.adminDeleteContentFromReport

window.adminDeleteContentFromReport = async function adminDeleteContentFromReport(contentId, contentType, username, userId){
  const reason = prompt(`Delete this ${contentType}?\n\nReason (required):`);
  if(!reason || !reason.trim()) return;
  try {
    // 🔒 SECURE RPC CALL — server verifies caller has manage_content permission
    // Map 'reel' to 'post' for the RPC (reels are posts with is_reel=true)
    const rpcContentType = contentType === 'reel' ? 'post' : contentType;
    const { error } = await db.rpc('delete_content', {
      p_content_type: rpcContentType,
      p_content_id: contentId,
      p_reason: reason.trim()
    });
    if(error) throw error;
    if(userId) await sendAdminNotification(userId, `Your ${contentType} has been removed by an admin for violating community guidelines. Reason: ${reason.trim()}`);
    toast(`✅ ${contentType} deleted`);
    closeModal();
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ You do not have permission to delete content');
    else if(msg.includes('INVALID_CONTENT_TYPE')) toast('❌ Invalid content type');
    else toast('❌ Delete failed: ' + msg);
  }
};
