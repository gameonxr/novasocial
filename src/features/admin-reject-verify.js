// adminRejectVerify — extracted from index.html
// Owner SHA-256: 5ad018b3f5eb8f3c54e1619aa3d69ccca11467d44bb37b84a59f46886ab725ce
// Classic script — exposes window.adminRejectVerify

window.adminRejectVerify = async function adminRejectVerify(requestId, userId, username){
  const notes = prompt(`Reject verification for "${username}"?\n\nReason:`);
  if(!notes||!notes.trim()) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('reject_verification', {
      p_request_id: requestId,
      p_user_id: userId,
      p_reason: notes.trim()
    });
    if(error) throw error;
    await sendAdminNotification(userId, `📋 Your verification request was not approved. Reason: ${notes.trim()}. You can reapply after addressing the issue.`);
    toast(`✅ Rejected for ${username}`);
    await loadVerifyList();
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ You do not have permission to reject verifications');
    else toast('❌ Failed: ' + msg);
  }
};
