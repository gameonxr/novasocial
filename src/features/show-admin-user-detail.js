// showAdminUserDetail — extracted from index.html
// Owner SHA-256: 1543df679b4651e54e527c8e78cc2c3894676b6a7a332f1fa0c07cdbf5e007d9
// Classic script — exposes window.showAdminUserDetail

window.showAdminUserDetail = async function showAdminUserDetail(userId){
  const m = modal('User Details');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:40px;display:flex;justify-content:center"><div class="spin" style="width:28px;height:28px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div>`;
  try {
    const [{data:user,error:uErr},{count:postCount}] = await Promise.all([
      db.from('profiles').select('*').eq('id',userId).single(),
      db.from('posts').select('id',{count:'exact',head:true}).eq('user_id',userId)
    ]);
    if(uErr) throw uErr;
    if(!user){ body.innerHTML='<div style="padding:30px;text-align:center;color:#FF2D7A">User not found</div>'; return; }
    const isSelf = (userId===ME.id);
    body.innerHTML = `<div style="padding:0">
      <div style="background:linear-gradient(135deg,rgba(255,45,122,0.1),rgba(0,229,255,0.1));padding:20px;display:flex;align-items:center;gap:14px;border-bottom:1px solid rgba(255,255,255,0.08)">
        ${av(user.avatar_url,user.username,56)}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-weight:800;font-size:16px;color:#fff">${esc(user.username)||'unknown'}</span>
            ${user.is_admin?'<span style="font-size:9px;font-weight:800;color:#FF2D7A;background:rgba(255,45,122,0.2);padding:2px 6px;border-radius:6px;border:1px solid #FF2D7A">ADMIN</span>':''}
            ${user.is_banned?'<span style="font-size:9px;font-weight:800;color:#ff4444;background:rgba(255,68,68,0.2);padding:2px 6px;border-radius:6px;border:1px solid #ff4444">BANNED</span>':''}
            ${user.is_msg_banned?'<span style="font-size:9px;font-weight:800;color:#ffaa00;background:rgba(255,170,0,0.2);padding:2px 6px;border-radius:6px;border:1px solid #ffaa00">MSG-BANNED</span>':''}
          </div>
          <div style="font-size:12px;color:#8A8A8A;margin-top:2px">${esc(user.full_name)||''}</div>
        </div>
      </div>
      <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px"><div style="font-size:10px;color:#8A8A8A;font-weight:700;text-transform:uppercase">Posts</div><div style="font-size:18px;font-weight:800;color:#00E5FF;margin-top:4px">${postCount||0}</div></div>
        <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px"><div style="font-size:10px;color:#8A8A8A;font-weight:700;text-transform:uppercase">Followers</div><div style="font-size:18px;font-weight:800;color:#FF2D7A;margin-top:4px">${user.followers_count||0}</div></div>
        <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;grid-column:span 2"><div style="font-size:10px;color:#8A8A8A;font-weight:700;text-transform:uppercase">Joined</div><div style="font-size:13px;color:#fff;margin-top:4px;font-weight:600">${user.created_at?new Date(user.created_at).toLocaleDateString():'Unknown'}</div></div>
        ${user.is_banned&&user.ban_reason?`<div style="background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:10px;padding:12px;grid-column:span 2"><div style="font-size:10px;color:#ff4444;font-weight:700;text-transform:uppercase">Ban Reason</div><div style="font-size:13px;color:#fff;margin-top:4px">${esc(user.ban_reason)}</div></div>`:''}
        ${user.is_msg_banned&&user.msg_ban_reason?`<div style="background:rgba(255,170,0,0.1);border:1px solid #ffaa00;border-radius:10px;padding:12px;grid-column:span 2"><div style="font-size:10px;color:#ffaa00;font-weight:700;text-transform:uppercase">Msg Ban Reason</div><div style="font-size:13px;color:#fff;margin-top:4px">${esc(user.msg_ban_reason)}</div></div>`:''}
      </div>
      ${!isSelf?`<div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px">
        <div style="font-size:11px;color:#8A8A8A;font-weight:700;text-transform:uppercase;margin-bottom:4px">Admin Actions</div>
        ${user.is_banned?`<button onclick="adminUnbanUser('${userId}','${esc(user.username||'').replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(61,184,61,0.1);border:1px solid #3db83d;border-radius:12px;color:#3db83d;font-weight:700;font-size:13px;cursor:pointer">${ico('unlock','#3db83d',16)} Unban User</button>`:`<button onclick="adminBanUser('${userId}','${esc(user.username||'').replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:12px;color:#ff4444;font-weight:700;font-size:13px;cursor:pointer">${ico('lock','#ff4444',16)} Ban User</button>`}
        ${user.is_msg_banned?`<button onclick="adminUnbanMsgUser('${userId}','${esc(user.username||'').replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(61,184,61,0.1);border:1px solid #3db83d;border-radius:12px;color:#3db83d;font-weight:700;font-size:13px;cursor:pointer">Unban Messages</button>`:`<button onclick="adminBanMsgUser('${userId}','${esc(user.username||'').replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(255,170,0,0.1);border:1px solid #ffaa00;border-radius:12px;color:#ffaa00;font-weight:700;font-size:13px;cursor:pointer">Ban Messages Only</button>`}
        ${user.is_admin?`<button onclick="adminDemoteUser('${userId}','${esc(user.username||'').replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(255,170,0,0.1);border:1px solid #ffaa00;border-radius:12px;color:#ffaa00;font-weight:700;font-size:13px;cursor:pointer">${ico('crown','#ffaa00',16)} Remove Admin</button>`:`<button onclick="adminPromoteUser('${userId}','${esc(user.username||'').replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(168,85,247,0.1);border:1px solid #a855f7;border-radius:12px;color:#a855f7;font-weight:700;font-size:13px;cursor:pointer">${ico('crown','#a855f7',16)} Promote to Admin</button>`}
      </div>`:'<div style="padding:16px;text-align:center;color:#8A8A8A;font-size:11px">Cannot perform actions on yourself</div>'}

      <!-- 📋 REPORTS SECTION — real data from DB -->
      <div style="padding:0 16px 16px">
        <div style="font-size:11px;color:#8A8A8A;font-weight:700;text-transform:uppercase;margin-bottom:8px">Reports History</div>
        <div id="admin-user-reports" style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:center;padding:10px"><div class="spin" style="width:20px;height:20px;border:2px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div>
        </div>
      </div>
    </div>`;

    // Fetch reports data (real, not mock)
    loadUserReportStats(userId);

  } catch(e) { body.innerHTML=`<div style="padding:30px;text-align:center;color:#FF2D7A;font-size:13px">Failed: ${e.message||'error'}</div>`; }
};
