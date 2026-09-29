// adminRejectBan — extracted from index.html
// Owner SHA-256: f8a14326ae19361263e1e12412db4c9df08a181dbf5a9e3a861c8aef0551ff64
// Classic script — exposes window.adminRejectBan

window.adminRejectBan = async function adminRejectBan(approvalId, targetUsername){
  const notes = prompt(`Reject ban recommendation for "${targetUsername}"?\n\nReason:`) || '';
  try {
    const {error} = await db.from('ban_approvals').update({status:'rejected',admin_id:ME.id,admin_notes:notes,reviewed_at:new Date().toISOString()}).eq('id',approvalId);
    if(error) throw error;
    await logAdminAction('reject_ban_recommendation',approvalId,'report',`Rejected ban recommendation for "${targetUsername}"`);
    toast(`✅ Ban recommendation rejected`);
    const content = document.getElementById('admin-content');
    if(content) await adminTabApprovals(content);
  } catch(e) { toast('❌ Failed: '+(e.message||'error')); }
};
