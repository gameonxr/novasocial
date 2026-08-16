// Extracted from index.html during Phase 78.
async function searchDM(q){
  if(!q.trim())return;
  const{data:u}=await db.from('profiles').select('*').ilike('username',`%${q}%`).neq('id',ME.id).limit(10);
  const r=document.getElementById('dms-res');if(!r)return;
  r.innerHTML=(u||[]).map(x=>`<div onclick="startDM('${x.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #0d0d0d;cursor:pointer">${av(x.avatar_url,x.username,46,false,isOnline(x.last_seen))}<div><div style="font-weight:700;font-size:14px">${x.username}</div><div style="color:#555;font-size:13px">${x.full_name||''}</div></div></div>`).join('')||'<div style="color:#444;text-align:center;padding:24px">Koi nahi mila</div>';
}
