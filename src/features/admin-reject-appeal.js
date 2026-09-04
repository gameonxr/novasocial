// adminRejectAppeal — extracted from index.html
// Owner SHA-256: 9daec0c8429f5e20631ec89283e3c78c66b5939a5f3b303397a26a3f15526035
// Classic script — exposes window.adminRejectAppeal

window.adminRejectAppeal = async function adminRejectAppeal(appealId, userId, username){
  const notes = prompt(`Reject appeal for "${username}"?\n\nReason:`);
  if(!notes||!notes.trim()) return;
  try {
    // 🔒 SECURE RPC CALL
    const { error } = await db.rpc('resolve_appeal', {
      p_appeal_id: appealId,
      p_decision: 'rejected',
      p_notes: notes.trim()
    });
    if(error) throw error;
    await sendAdminNotification(userId, `📋 Your ban appeal was not approved. Reason: ${notes.trim()}`);
    toast(`✅ Appeal rejected for ${username}`);
    await loadAppealsList();
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PERMISSION_DENIED')) toast('❌ You do not have permission to resolve appeals');
    else toast('❌ Failed: ' + msg);
  }
};
