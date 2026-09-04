// moderatorRecommendBan — extracted from index.html
// Owner SHA-256: 51da25a9c777288493ca63f90a430b9c3b3932580a8e4e7439d0decebeb24b1d
// Classic script — exposes window.moderatorRecommendBan

window.moderatorRecommendBan = async function moderatorRecommendBan(targetUserId, targetUsername, reason, reportId){
  if(!PROF?.is_moderator && !PROF?.is_admin && !PROF?.is_super_admin){
    toast('❌ Only staff can recommend bans');
    return;
  }
  if(!reason || !reason.trim()){ toast('Please provide a reason'); return; }
  try {
    const {error} = await db.from('ban_approvals').insert({
      moderator_id: ME.id,
      target_user_id: targetUserId,
      reason: reason.trim(),
      target_type: 'user',
      target_id: reportId || null,
      status: 'pending'
    });
    if(error) throw error;
    await logAdminAction('recommend_ban', targetUserId, 'user', `Recommended ban for "${targetUsername}": ${reason.trim()}`);
    toast('✅ Ban recommendation sent to admins for approval');
    closeModal();
  } catch(e) { toast('❌ Failed: '+(e.message||'error')); }
};
