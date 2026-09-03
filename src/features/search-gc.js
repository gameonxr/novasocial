// searchGC — extracted from index.html
// Owner SHA-256: 7d9ee25868e6eac3c5337aa8bdda0b65fd5b05b7dea8db2041e5bf6ed62a1ab2
// Classic script — exposes window.searchGC

window.searchGC = async function searchGC(q){
  if(!q.trim())return;
  const{data:u}=await db.from('profiles').select('*').ilike('username',`%${q}%`).neq('id',ME.id).limit(10);
  const r=document.getElementById('gc-r');if(!r)return;
  r.innerHTML=(u||[]).map(x=>`<div onclick="togGC('${x.id}',this)" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #0d0d0d;cursor:pointer"><div id="gc-chk-${x.id}" style="width:24px;height:24px;border-radius:7px;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0"></div>${av(x.avatar_url,x.username,44)}<span style="font-weight:600;font-size:14px">${x.username}</span></div>`).join('');
};
