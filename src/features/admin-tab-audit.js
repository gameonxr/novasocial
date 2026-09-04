// adminTabAudit — extracted from index.html
// Owner SHA-256: b576799c60dd6a242a74aa21b8921e29ae00cdfc7d568a28d242b856f4f81720
// Classic script — exposes window.adminTabAudit

window.adminTabAudit = async function adminTabAudit(content){
  // 📋 Action type label mapping — saare known types cover kiye gaye, aur fallback bhi hai
  // taaki koi bhi future action type bhi skip na ho
  const actionLabels = {
    ban_user: 'Banned user',
    unban_user: 'Unbanned user',
    shadowban_user: 'Shadowbanned user',
    suspend_user: 'Suspended user',
    restore_user: 'Restored user',
    msg_ban_user: 'Restricted messaging',
    msg_unban_user: 'Restored messaging',
    promote_user: 'Promoted user',
    demote_user: 'Demoted user',
    delete_content: 'Deleted content',
    restore_content: 'Restored content',
    hide_content: 'Hidden content',
    mark_report_reviewed: 'Reviewed report',
    assign_report: 'Assigned report',
    resolve_appeal: 'Resolved appeal',
    update_feature_flag: 'Updated feature flag',
    emergency_lock_toggle: 'Toggled emergency lock',
    revoke_sessions: 'Revoked sessions',
    approve_verification: 'Approved verification',
    reject_verification: 'Rejected verification',
    issue_strike: 'Issued strike',
    export_audit_logs: 'Exported audit logs',
    protected_account_access_attempt: '⚠️ Protected account access blocked',
    super_admin_protection_violation: '⚠️ Super admin protection triggered',
  };

  // 🎨 Color coding by action category
  // ⚠️ Order matters — sabse specific match pehle, generic 'ban' sabse aakhir mein
  // (warn: 'unban_user' aur 'msg_unban_user' ke andar 'ban' word hota hai,
  // isliye generic 'ban' check ko sabse neeche rakha gaya hai)
  const actionColor = (type) => {
    if(type === 'unban_user' || type === 'msg_unban_user' || type.includes('restore') || type.includes('resolve') || type.includes('approve')) return '#3db83d'; // green
    if(type === 'msg_ban_user' || type.includes('suspend') || type.includes('shadowban') || type.includes('hide') || type.includes('revoke')) return '#ffaa00'; // yellow
    if(type.includes('promote') || type.includes('demote') || type.includes('role')) return '#a855f7'; // purple
    if(type.includes('verify') || type.includes('verification')) return '#3897f0'; // blue
    if(type.includes('emergency') || type.includes('flag') || type.includes('export')) return '#ff8800'; // orange
    if(type.includes('assign') || type.includes('review')) return '#00E5FF'; // cyan
    if(type === 'ban_user' || type.includes('delete') || type.includes('strike') || type.includes('violation') || type.includes('blocked')) return '#ff4444'; // red — ab sabse aakhir mein, sirf genuine "full ban"/delete/strike ke liye
    return '#00E5FF'; // default
  };

  let actions = [];
  let usedTable = '';

  // 🔄 STEP 1: Try audit_logs FIRST (source of truth — has ALL action types)
  try {
    const {data, error} = await db.from('audit_logs')
      .select('id,actor_id,actor_role,target_type,target_id,action_type,reason,ip_address,user_agent,status,created_at,profiles!audit_logs_actor_id_fkey(username,avatar_url)')
      .order('created_at',{ascending:false})
      .limit(100);
    if(!error && data && data.length > 0){
      actions = data.map(a => ({
        id: a.id,
        admin_id: a.actor_id,
        action_type: a.action_type,
        target_id: a.target_id,
        target_type: a.target_type,
        notes: a.reason,
        created_at: a.created_at,
        ip_address: a.ip_address,
        user_agent: a.user_agent,
        status: a.status,
        actor_role: a.actor_role,
        profiles: a.profiles
      }));
      usedTable = 'audit_logs';
    } else if(error){
      console.log('[AUDIT] audit_logs query failed (RLS may block for non-super-admin), falling back to admin_actions:', error.message);
    }
  } catch(e) {
    console.log('[AUDIT] audit_logs exception, falling back:', e.message);
  }

  // 🔄 STEP 2: Fallback to admin_actions if audit_logs returned nothing (RLS restriction for non-super-admin)
  if(actions.length === 0){
    try {
      const {data,error} = await db.from('admin_actions')
        .select('id,admin_id,action_type,target_id,target_type,notes,created_at,ip_address,user_agent,profiles!admin_actions_admin_id_fkey(username,avatar_url)')
        .order('created_at',{ascending:false})
        .limit(100);
      if(!error && data){
        actions = data;
        usedTable = 'admin_actions';
      }
    } catch(e) {}
  }

  if(actions.length===0){
    content.innerHTML=`<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">
      <div style="font-size:36px;margin-bottom:8px">📋</div>
      No audit entries found
    </div>`;
    return;
  }

  content.innerHTML = `
    <div style="font-size:10px;color:#555;margin-bottom:8px;text-align:right">
      Showing ${actions.length} entries from ${usedTable}
    </div>
    ${actions.map(a=>{
      const p=a.profiles||{};
      const label = actionLabels[a.action_type] || a.action_type.replace(/_/g,' ');
      const ac = actionColor(a.action_type);
      const statusBadge = a.status && a.status !== 'success' ? `<span style="font-size:9px;color:${a.status==='denied'?'#ff4444':a.status==='failed'?'#ffaa00':'#888'};background:rgba(255,255,255,0.05);padding:1px 5px;border-radius:4px;margin-left:6px;text-transform:uppercase">${a.status}</span>` : '';
      const roleBadge = a.actor_role && a.actor_role !== 'user' ? `<span style="font-size:9px;color:#a855f7;margin-left:4px">${a.actor_role}</span>` : '';
      return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:8px">
            ${av(p.avatar_url,p.username,28)}
            <div>
              <div style="font-size:12px;font-weight:700;color:${ac}">${esc(label)}${statusBadge}</div>
              <div style="font-size:10px;color:#8A8A8A">by ${esc(p.username)||'admin'}${roleBadge}</div>
            </div>
          </div>
          <span style="font-size:10px;color:#8A8A8A">${new Date(a.created_at).toLocaleString()}</span>
        </div>
        ${a.target_type?`<div style="font-size:11px;color:#8A8A8A">Target: ${esc(a.target_type)}${a.target_id?' · '+String(a.target_id).substring(0,8):''}</div>`:''}
        ${a.notes?`<div style="font-size:11px;color:#fff;margin-top:6px;background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:6px">${esc(a.notes)}</div>`:''}
        ${a.ip_address?`<div style="font-size:9px;color:#555;margin-top:4px">🌐 ${esc(a.ip_address)}</div>`:''}
      </div>`;
    }).join('')}
  `;
};
