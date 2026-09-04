// searchUserForPromotion — extracted from index.html
// Owner SHA-256: 1ea47b5546d9e03186222883f052cb84a5167f9f01221ae6d417901ca0e88d31
// Classic script — exposes window.searchUserForPromotion

window.searchUserForPromotion = async function searchUserForPromotion(query){
  clearTimeout(_teamSearchTimer);
  _teamSearchTimer = setTimeout(async () => {
    const resultsEl = document.getElementById('team-search-results');
    if(!resultsEl) return;
    if(!query || query.trim().length < 2){ resultsEl.innerHTML = ''; return; }
    try {
      const { data: users, error } = await db.from('profiles')
        .select('id,username,avatar_url,is_admin,is_moderator,is_super_admin')
        .ilike('username', '%'+query.trim()+'%')
        .neq('id', ME.id)
        .limit(5);
      if(error) throw error;
      if(!users || users.length === 0){ resultsEl.innerHTML = '<div style="font-size:11px;color:#666;padding:6px">No users found</div>'; return; }

      const isSuper = PROF?.is_super_admin === true;

      resultsEl.innerHTML = users.map(u => {
        const alreadyStaff = u.is_admin || u.is_moderator || u.is_super_admin;
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(255,255,255,0.03);border-radius:8px">
          ${av(u.avatar_url, u.username, 28)}
          <span style="flex:1;font-size:12px;color:#fff;font-weight:600">${esc(u.username)}</span>
          ${alreadyStaff ? '<span style="font-size:10px;color:#8A8A8A">Already staff</span>' :
            isSuper ? `
              <button onclick="adminPromoteModerator('${u.id}','${esc(u.username||'').replace(/'/g,"\\'")}')" style="padding:4px 8px;background:rgba(0,229,255,0.1);border:1px solid #00E5FF;border-radius:6px;color:#00E5FF;font-size:10px;font-weight:700;cursor:pointer">Make Mod</button>
              <button onclick="adminPromoteUser('${u.id}','${esc(u.username||'').replace(/'/g,"\\'")}')" style="padding:4px 8px;background:rgba(168,85,247,0.1);border:1px solid #a855f7;border-radius:6px;color:#a855f7;font-size:10px;font-weight:700;cursor:pointer">Make Admin</button>
            ` : `
              <button onclick="adminPromoteModerator('${u.id}','${esc(u.username||'').replace(/'/g,"\\'")}')" style="padding:4px 8px;background:rgba(0,229,255,0.1);border:1px solid #00E5FF;border-radius:6px;color:#00E5FF;font-size:10px;font-weight:700;cursor:pointer">Make Mod</button>
            `
          }
        </div>`;
      }).join('');
    } catch(e) { resultsEl.innerHTML = '<div style="font-size:11px;color:#FF2D7A;padding:6px">Search failed</div>'; }
  }, 300);
};
