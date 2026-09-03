// searchAddMember — extracted from index.html
// Owner SHA-256: 1b52e46b7907ac193fb3d1f3e50139eb835d6466f9780a968af2cd34dba04a7e
// Classic script — exposes window.searchAddMember

window.searchAddMember = async function searchAddMember(q,cid){
  if(!q.trim())return;
  const exIds=(window._chatMembers||[]).map(m=>m.user_id);
  const{data:u}=await db.from('profiles').select('*').ilike('username',`%${q}%`).limit(8);
  const filtered=(u||[]).filter(x=>!exIds.includes(x.id));
  const r=document.getElementById('gc-add-res');if(!r)return;
  r.innerHTML=filtered.map(x=>`
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #0d0d0d">
      ${av(x.avatar_url,x.username,40)}
      <div style="flex:1"><div style="font-weight:700;font-size:14px">${x.username}</div><div style="color:#555;font-size:12px">${x.full_name||''}</div></div>
      <button onclick="addToGroup('${cid}','${x.id}','${(x.username||'').replace(/'/g,"\'")}',this)" style="background:${GRAD};border:none;border-radius:8px;color:#fff;font-size:12px;padding:6px 12px;cursor:pointer">Add</button>
    </div>`).join('')||'<div style="color:#444;text-align:center;padding:16px">Koi nahi mila</div>';
};
