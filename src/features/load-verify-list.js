// loadVerifyList — extracted from index.html
// Owner SHA-256: b3650060d19c039a122839b71e04c3998765cae6b1895721bea201cf7e07cbd9
// Classic script — exposes window.loadVerifyList

window.loadVerifyList = async function loadVerifyList(){
  const listEl = document.getElementById('admin-verify-list');
  if(!listEl) return;
  try {
    let q = db.from('verification_requests').select('id,user_id,full_name,category,reason,id_proof_url,social_links,status,admin_notes,created_at,profiles!verification_requests_user_id_fkey(username,avatar_url,full_name,followers_count)').order('created_at',{ascending:false}).limit(50);
    if(_verifyFilter!=='all') q=q.eq('status',_verifyFilter);
    const {data:requests,error} = await q;
    if(error) throw error;
    if(!requests||requests.length===0){ listEl.innerHTML=`<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No ${_verifyFilter} verification requests</div>`; return; }
    listEl.innerHTML = requests.map(r=>{
      const p=r.profiles||{};
      const sc=r.status==='approved'?'#3db83d':r.status==='rejected'?'#ff4444':'#3897f0';
      return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          ${av(p.avatar_url,p.username,40)}
          <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span style="font-weight:700;font-size:13px;color:#fff">${esc(p.username)||'unknown'}</span><span style="font-size:9px;font-weight:800;color:${sc};background:${sc}26;padding:2px 6px;border-radius:6px;text-transform:uppercase">${r.status}</span></div><div style="font-size:11px;color:#8A8A8A;margin-top:2px">${esc(r.full_name||p.full_name||'')} · ${esc(r.category)}</div></div>
        </div>
        <div style="font-size:12px;color:#fff;background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:8px;margin-bottom:8px;line-height:1.4">${esc(r.reason)}</div>
        ${r.id_proof_url?`<div style="font-size:11px;color:#4a90d9;margin-bottom:6px"><a href="${esc(r.id_proof_url)}" target="_blank" style="color:#4a90d9">View ID Proof</a></div>`:''}
        ${r.status==='pending'?`<div style="display:flex;gap:6px">
          <button onclick="adminApproveVerify('${r.id}','${r.user_id}','${esc(p.username||'user').replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(61,184,61,0.1);border:1px solid #3db83d;border-radius:8px;color:#3db83d;font-size:11px;font-weight:700;cursor:pointer">Approve</button>
          <button onclick="adminRejectVerify('${r.id}','${r.user_id}','${esc(p.username||'user').replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:8px;color:#ff4444;font-size:11px;font-weight:700;cursor:pointer">Reject</button>
        </div>`:''}
      </div>`;
    }).join('');
  } catch(e) { listEl.innerHTML=`<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`; }
};
