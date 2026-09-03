// adminApproveBan — extracted from index.html
// Owner SHA-256: 7baf6d18922f94b3913f8e0c8033ecbcf6298db5f29ce6e22eae23a51aca0d17
// Classic script — exposes window.adminApproveBan

window.adminApproveBan = async function adminApproveBan(approvalId, targetUserId, targetUsername){
  const reason = prompt(`Approve ban for "${targetUsername}"?\n\nConfirm reason:`);
  if(!reason || !reason.trim()) return;
  try {
    // 🔒 SECURE RPC CALL — bans the user server-side with all checks
    const { error: banError } = await db.rpc('ban_user', {
      p_target_id: targetUserId,
      p_reason: 'Ban approved by admin (moderator recommendation): ' + reason.trim(),
      p_is_permanent: true
    });
    if(banError) throw banError;
    // Update the approval record (this is just status tracking, not a security action)
    await db.from('ban_approvals').update({status:'approved',admin_id:ME.id,admin_notes:reason.trim(),reviewed_at:new Date().toISOString()}).eq('id',approvalId);
    await sendAdminNotification(targetUserId, `🚫 Your account has been banned by admin approval. Reason: ${reason.trim()}`);
    toast(`✅ ${targetUsername} banned`);
    const content = document.getElementById('admin-content');
    if(content) await adminTabApprovals(content);
  } catch(e) { toast('❌ Failed: '+(e.message||'error')); }
};
