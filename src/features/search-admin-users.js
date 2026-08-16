// Extracted from index.html during Phase 84.
async function searchAdminUsers(query){
  clearTimeout(_adminUserSearchTimer);
  _adminUserSearchTimer = setTimeout(async () => {
    const listEl = document.getElementById('admin-user-list');
    if(!listEl) return;
    try {
      let q = db.from('profiles').select('id,username,full_name,avatar_url,is_admin,is_banned,is_msg_banned,ban_reason,msg_ban_reason,created_at,last_seen,posts_count').order('created_at',{ascending:false}).limit(50);
      if(query&&query.trim()) q = q.ilike('username','%'+query.trim()+'%');
      const { data: users, error } = await q;
      if(error) throw error;
      if(!users||users.length===0){ listEl.innerHTML='<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No users found</div>'; return; }
      listEl.innerHTML = users.map(u=>`
        <div onclick="showAdminUserDetail('${u.id}')" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px">
          ${av(u.avatar_url,u.username,40)}
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <span style="font-weight:700;font-size:13px;color:#fff">${esc(u.username)||'unknown'}</span>
              ${u.is_admin?'<span style="font-size:9px;font-weight:800;color:#FF2D7A;background:rgba(255,45,122,0.15);padding:2px 6px;border-radius:6px;border:1px solid #FF2D7A">ADMIN</span>':''}
              ${u.is_banned?'<span style="font-size:9px;font-weight:800;color:#ff4444;background:rgba(255,68,68,0.15);padding:2px 6px;border-radius:6px;border:1px solid #ff4444">BANNED</span>':''}
              ${u.is_msg_banned?'<span style="font-size:9px;font-weight:800;color:#ffaa00;background:rgba(255,170,0,0.15);padding:2px 6px;border-radius:6px;border:1px solid #ffaa00">MSG-BANNED</span>':''}
            </div>
            <div style="font-size:11px;color:#8A8A8A;margin-top:2px">${esc(u.full_name)||''} ${u.posts_count!==undefined?'· '+u.posts_count+' posts':''}</div>
          </div>
          ${ico('chevron_right','#555',16)}
        </div>`).join('');
    } catch(e) { listEl.innerHTML=`<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`; }
  }, 300);
}
