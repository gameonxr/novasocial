// adminApproveVerify — extracted from index.html
// Owner SHA-256: 2fe970aac77a5be56eb5af1509b5845fb546a7046fa9ace7acce7a60c39f5f9e
// Classic script — exposes window.adminApproveVerify

window.adminApproveVerify = async function adminApproveVerify(requestId, userId, username){
  const notes = prompt(`Approve verification for "${username}"?\n\nOptional note:`) || '';
  try {
    // 🔒 SECURE RPC CALL — updates both verification_requests and profiles atomically
    const { error } = await db.rpc('approve_verification', {
      p_request_id: requestId,
      p_user_id: userId
    });
    if(error) throw error;
    await sendAdminNotification(userId, `🎉 Congratulations! Your verification request has been approved. You now have the verified badge.`);
    toast(`✅ ${username} is now verified`);
    await loadVerifyList();
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ You do not have permission to approve verifications');
    else toast('❌ Failed: ' + msg);
  }
};
