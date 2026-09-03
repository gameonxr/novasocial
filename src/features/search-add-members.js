// searchAddMembers — extracted from index.html
// Owner SHA-256: e4a999f92a0755ea299540b086b9b39c0dc649128f3382b417f8eb8766df9baa
// Classic script — exposes window.searchAddMembers

window.searchAddMembers = async function searchAddMembers(cid,q){
  if(!q.trim()){document.getElementById('am-results').innerHTML='';return;}
  const[{data:existing},{data:users}]=await Promise.all([
    db.from('conversation_members').select('user_id').eq('conversation_id',cid),
    db.from('profiles').select('*').ilike('username',`%${q}%`).limit(15)
  ]);
  const existingIds=new Set((existing||[]).map(e=>e.user_id));
  const r=document.getElementById('am-results');if(!r)return;
  const filtered=(users||[]).filter(u=>!existingIds.has(u.id));
  r.innerHTML=filtered.map(u=>`<div id="am-row-${u.id}" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #0d0d0d">${av(u.avatar_url,u.username,40)}<span style="font-weight:600;font-size:14px;flex:1">${u.username}</span><button class="bgrd" style="width:auto;padding:7px 16px;font-size:12px" onclick="addMemberToGroup('${cid}','${u.id}')">Add</button></div>`).join('')||'<div style="color:#444;text-align:center;padding:20px">Koi nahi mila</div>';
};
