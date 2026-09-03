// adminTabDashboard — extracted from index.html
// Owner SHA-256: c2a9e27d6c95ae2ea322abaf35d2a460ee1fbbeaa06911ad8a3eeb8336dc3501
// Classic script — exposes window.adminTabDashboard

window.adminTabDashboard = async function adminTabDashboard(content){
  const fc = async (table, filter) => { try { let q = db.from(table).select('id',{count:'exact',head:true}); if(filter) q=filter(q); const {count}=await q; return count||0; } catch(e){ return 0; } };
  const [tu,tp,at,nu,pr,bu,pv,pa] = await Promise.all([
    fc('profiles'), fc('posts'),
    fc('profiles',q=>q.gt('last_seen',new Date(Date.now()-86400000).toISOString())),
    fc('profiles',q=>q.gt('created_at',new Date(Date.now()-604800000).toISOString())),
    fc('reports',q=>q.eq('status','pending')),
    fc('profiles',q=>q.eq('is_banned',true)),
    fc('verification_requests',q=>q.eq('status','pending')),
    fc('ban_appeals',q=>q.eq('status','pending'))
  ]);
  const stats = [
    {l:'Total Users',v:tu,c:'#FF2D7A'},{l:'Total Posts',v:tp,c:'#00E5FF'},
    {l:'Active Today',v:at,c:'#3db83d'},{l:'New (7d)',v:nu,c:'#a855f7'},
    {l:'Pending Reports',v:pr,c:'#ffaa00'},{l:'Banned',v:bu,c:'#ff4444'},
    {l:'Verify Requests',v:pv,c:'#3897f0'},{l:'Appeals',v:pa,c:'#ff8800'},
  ];
  content.innerHTML = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
    ${stats.map(s=>`<div style="background:${s.c}1a;border:1px solid ${s.c}33;border-radius:14px;padding:14px"><div style="font-size:24px;font-weight:800;color:${s.c}">${(s.v||0).toLocaleString()}</div><div style="font-size:11px;color:#8A8A8A;font-weight:600;margin-top:4px">${s.l}</div></div>`).join('')}
  </div>`;
};
