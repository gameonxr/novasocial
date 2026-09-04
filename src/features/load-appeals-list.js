// loadAppealsList — extracted from index.html
// Owner SHA-256: 58f81b1211e0c64364ef0d1bab308edddafc5a6470a8ba1d64b1459e118c1928
// Classic script — exposes window.loadAppealsList

window.loadAppealsList = async function loadAppealsList(){
  const listEl = document.getElementById('admin-appeals-list');
  if(!listEl) return;
  try {
    let q = db.from('ban_appeals').select('id,user_id,appeal_reason,status,admin_notes,created_at,profiles!ban_appeals_user_id_fkey(username,avatar_url,ban_reason)').order('created_at',{ascending:false}).limit(50);
    if(_appealsFilter!=='all') q=q.eq('status',_appealsFilter);
    const {data:appeals,error} = await q;
    if(error) throw error;
    if(!appeals||appeals.length===0){ listEl.innerHTML=`<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No ${_appealsFilter} appeals</div>`; return; }
    listEl.innerHTML = appeals.map(a=>{
      const p=a.profiles||{};
      const sc=a.status==='approved'?'#3db83d':a.status==='rejected'?'#ff4444':'#ff8800';
      return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          ${av(p.avatar_url,p.username,40)}
          <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span style="font-weight:700;font-size:13px;color:#fff">${esc(p.username)||'unknown'}</span><span style="font-size:9px;font-weight:800;color:${sc};background:${sc}26;padding:2px 6px;border-radius:6px;text-transform:uppercase">${a.status}</span></div>${p.ban_reason?`<div style="font-size:11px;color:#ff4444;margin-top:2px">Banned: ${esc(p.ban_reason)}</div>`:''}</div>
        </div>
        <div style="font-size:12px;color:#fff;background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:8px;margin-bottom:8px;line-height:1.4">${esc(a.appeal_reason)}</div>
        ${a.status==='pending'?`<div style="display:flex;gap:6px">
          <button onclick="adminApproveAppeal('${a.id}','${a.user_id}','${esc(p.username||'user').replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(61,184,61,0.1);border:1px solid #3db83d;border-radius:8px;color:#3db83d;font-size:11px;font-weight:700;cursor:pointer">Approve (Unban)</button>
          <button onclick="adminRejectAppeal('${a.id}','${a.user_id}','${esc(p.username||'user').replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:8px;color:#ff4444;font-size:11px;font-weight:700;cursor:pointer">Reject</button>
        </div>`:''}
      </div>`;
    }).join('');
  } catch(e) { listEl.innerHTML=`<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`; }
};
