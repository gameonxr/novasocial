// adminApproveAppeal — extracted from index.html
// Owner SHA-256: 72ffe07284da2664d49bd5ea7c2c6ca7977e12e225ca31f12edb170006981567
// Classic script — exposes window.adminApproveAppeal

window.adminApproveAppeal = async function adminApproveAppeal(appealId, userId, username){
  const notes = prompt(`Approve appeal for "${username}"?\n\nThis will UNBAN the user.\n\nNote:`) || '';
  try {
    // 🔒 SECURE RPC CALL — resolves appeal AND unbans user atomically, server-side
    const { error } = await db.rpc('resolve_appeal', {
      p_appeal_id: appealId,
      p_decision: 'approved',
      p_notes: notes
    });
    if(error) throw error;
    await sendAdminNotification(userId, `✅ Your ban appeal has been approved! Your account is now restored. Welcome back to NovaSocial.`);
    toast(`✅ ${username} unbanned`);
    await loadAppealsList();
  } catch(e) {
    const msg = e.message || '';
    if(msg.includes('PROTECTED_ACCOUNT')) toast('❌ Cannot approve appeal for protected user (requires super admin)');
    else if(msg.includes('PERMISSION_DENIED')) toast('❌ You do not have permission to resolve appeals');
    else toast('❌ Failed: ' + msg);
  }
};
