// loadTeamList — extracted from index.html
// Owner SHA-256: 9d00727a2cea55fd39c79a2824a8b3915ba25e60d2cb0bbbbb0f54c152aa8579
// Classic script — exposes window.loadTeamList

window.loadTeamList = async function loadTeamList(){
  const listEl = document.getElementById('admin-team-list');
  if(!listEl) return;
  const isSuper = PROF?.is_super_admin === true;
  const isAdmin = PROF?.is_admin === true;

  try {
    // Fetch all admins + moderators (real data)
    const { data: staff, error } = await db.from('profiles')
      .select('id,username,avatar_url,full_name,is_admin,is_super_admin,is_moderator,is_banned,created_at,last_seen')
      .or('is_admin.eq.true,is_moderator.eq.true')
      .order('is_super_admin', { ascending: false })
      .order('is_admin', { ascending: false })
      .order('created_at', { ascending: true });

    if(error) throw error;

    if(!staff || staff.length === 0){
      listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No staff members</div>';
      return;
    }

    listEl.innerHTML = staff.map(s => {
      let roleBadge = '';
      let roleColor = '#8A8A8A';
      if(s.is_super_admin){ roleBadge = 'SUPER ADMIN'; roleColor = '#FF2D7A'; }
      else if(s.is_admin){ roleBadge = 'ADMIN'; roleColor = '#a855f7'; }
      else if(s.is_moderator){ roleBadge = 'MODERATOR'; roleColor = '#00E5FF'; }

      const isSelf = s.id === ME.id;
      // Can manage this person?
      // Super admin can manage everyone (except self for demote)
      // Admin can manage moderators only (not other admins, not super admin)
      const canManage = !isSelf && (
        isSuper ? true :
        isAdmin ? (s.is_moderator && !s.is_admin && !s.is_super_admin) :
        false
      );

      return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;display:flex;align-items:center;gap:10px">
        ${av(s.avatar_url, s.username, 40)}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-weight:700;font-size:13px;color:#fff">${esc(s.username)}</span>
            <span style="font-size:9px;font-weight:800;color:${roleColor};background:${roleColor}26;padding:2px 6px;border-radius:6px;border:1px solid ${roleColor}">${roleBadge}</span>
            ${isSelf ? '<span style="font-size:9px;color:#555">(You)</span>' : ''}
            ${s.is_banned ? '<span style="font-size:9px;color:#ff4444">BANNED</span>' : ''}
          </div>
          <div style="font-size:11px;color:#8A8A8A;margin-top:2px">${esc(s.full_name||'')} · ${s.last_seen ? 'Active ' + new Date(s.last_seen).toLocaleDateString() : 'Never active'}</div>
        </div>
        ${canManage ? `
          <div onclick="showStaffActions('${s.id}','${esc(s.username||'').replace(/'/g,"\\'")}','${s.is_admin?'admin':'moderator'}','${s.is_super_admin?'super':''}')" style="cursor:pointer;padding:6px 10px;background:rgba(255,255,255,0.06);border-radius:8px;font-size:11px;font-weight:700;color:#fff">Manage</div>
        ` : ''}
      </div>`;
    }).join('');
  } catch(e) {
    listEl.innerHTML = `<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`;
  }
};
