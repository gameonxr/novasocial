// adminTabApprovals — extracted from index.html
// Owner SHA-256: 40dd10a1a317935f66575762cdde601ec3fb4fe95267671402ea02561d4d0fed
// Classic script — exposes window.adminTabApprovals

window.adminTabApprovals = async function adminTabApprovals(content){
  content.innerHTML = `<div id="admin-approvals-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(255,170,0,0.2);border-top-color:#ffaa00;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>`;

  const listEl = document.getElementById('admin-approvals-list');
  if(!listEl) return;

  try {
    const { data: approvals, error } = await db.from('ban_approvals')
      .select('id,moderator_id,target_user_id,reason,target_type,target_id,status,admin_notes,created_at,reviewed_at,profiles!ban_approvals_moderator_id_fkey(username,avatar_url),target_profile:profiles!ban_approvals_target_user_id_fkey(username,avatar_url,is_banned)')
      .eq('status','pending')
      .order('created_at',{ascending:false})
      .limit(50);

    if(error) throw error;

    if(!approvals || approvals.length === 0){
      listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No pending ban approvals</div>';
      return;
    }

    listEl.innerHTML = approvals.map(a => {
      const mod = a.profiles || {};
      const target = a.target_profile || {};
      return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A8A8A">${av(mod.avatar_url,mod.username,20)} Recommended by @${esc(mod.username)}</div>
          <span style="font-size:10px;color:#8A8A8A">${new Date(a.created_at).toLocaleDateString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          ${av(target.avatar_url,target.username,32)}
          <div><div style="font-size:13px;font-weight:700;color:#fff">@${esc(target.username)}</div>${target.is_banned?'<span style="font-size:9px;color:#ff4444">Already banned</span>':''}</div>
        </div>
        <div style="font-size:12px;color:#fff;background:rgba(0,0,0,0.3);padding:8px;border-radius:8px;margin-bottom:8px">${esc(a.reason)}</div>
        <div style="display:flex;gap:6px">
          <button onclick="adminApproveBan('${a.id}','${a.target_user_id}','${esc(target.username||'').replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:8px;color:#ff4444;font-size:11px;font-weight:700;cursor:pointer">Approve Ban</button>
          <button onclick="adminRejectBan('${a.id}','${esc(target.username||'').replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Reject</button>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    listEl.innerHTML = `<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`;
  }
};
