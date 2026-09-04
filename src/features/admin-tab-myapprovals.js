// adminTabMyApprovals — extracted from index.html
// Owner SHA-256: d3d15c59e2c1a7afd26acef0583d45ca3a49c29f1bba68cb7480ce64e019a82c
// Classic script — exposes window.adminTabMyApprovals

window.adminTabMyApprovals = async function adminTabMyApprovals(content){
  content.innerHTML = `<div id="admin-myapprovals-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(0,229,255,0.2);border-top-color:#00E5FF;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>`;

  const listEl = document.getElementById('admin-myapprovals-list');
  if(!listEl) return;

  try {
    const { data: myReqs, error } = await db.from('ban_approvals')
      .select('id,target_user_id,reason,status,admin_notes,created_at,reviewed_at,profiles!ban_approvals_target_user_id_fkey(username,avatar_url)')
      .eq('moderator_id', ME.id)
      .order('created_at',{ascending:false})
      .limit(50);

    if(error) throw error;

    if(!myReqs || myReqs.length === 0){
      listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">You have not made any ban recommendations</div>';
      return;
    }

    listEl.innerHTML = myReqs.map(r => {
      const target = r.profiles || {};
      const sc = r.status === 'approved' ? '#3db83d' : r.status === 'rejected' ? '#ff4444' : '#ffaa00';
      return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          ${av(target.avatar_url,target.username,28)}
          <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">@${esc(target.username)}</div></div>
          <span style="font-size:10px;font-weight:800;color:${sc};text-transform:uppercase">${r.status}</span>
        </div>
        <div style="font-size:12px;color:#fff;background:rgba(0,0,0,0.3);padding:8px;border-radius:8px;margin-bottom:6px">${esc(r.reason)}</div>
        ${r.admin_notes ? `<div style="font-size:11px;color:#ffaa00;margin-bottom:4px">Admin: ${esc(r.admin_notes)}</div>` : ''}
        <div style="font-size:10px;color:#8A8A8A">${new Date(r.created_at).toLocaleString()}</div>
      </div>`;
    }).join('');
  } catch(e) {
    listEl.innerHTML = `<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`;
  }
};
