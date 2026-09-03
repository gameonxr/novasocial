// loadUserReportStats — extracted from index.html
// Owner SHA-256: f55c81b59e8dc0e29403495d06611850a50fbf1a2f6f5e02fe092f5fd0e211ba
// Classic script — exposes window.loadUserReportStats

window.loadUserReportStats = async function loadUserReportStats(userId){
  const container = document.getElementById('admin-user-reports');
  if(!container) return;
  try {
    // Reports AGAINST this user (target_type = 'user', target_id = userId)
    const [{count: reportsAgainst}, {count: reportsByUser}, {data: recentAgainst}] = await Promise.all([
      db.from('reports').select('id', {count:'exact', head:true}).eq('target_type','user').eq('target_id',userId),
      db.from('reports').select('id', {count:'exact', head:true}).eq('reporter_id',userId),
      db.from('reports').select('id,target_type,target_id,reason,status,created_at').eq('target_type','user').eq('target_id',userId).order('created_at',{ascending:false}).limit(5)
    ]);

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div style="background:rgba(255,68,68,0.1);border:1px solid #ff444433;border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#ff4444">${reportsAgainst || 0}</div>
          <div style="font-size:10px;color:#8A8A8A">Reports Against</div>
        </div>
        <div style="background:rgba(255,170,0,0.1);border:1px solid #ffaa0033;border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#ffaa00">${reportsByUser || 0}</div>
          <div style="font-size:10px;color:#8A8A8A">Reports Filed</div>
        </div>
      </div>
      ${recentAgainst && recentAgainst.length > 0 ? `
        <div style="font-size:10px;color:#8A8A8A;font-weight:700;margin-bottom:6px;text-transform:uppercase">Recent Reports Against This User</div>
        ${recentAgainst.map(r => `
          <div onclick="showReportDetail('${r.id}')" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px 10px;cursor:pointer;display:flex;justify-content:space-between;align-items:center">
            <div><span style="font-size:11px;color:#FF2D7A;font-weight:700">${esc(r.reason)}</span><span style="font-size:10px;color:#8A8A8A;margin-left:8px">${new Date(r.created_at).toLocaleDateString()}</span></div>
            <span style="font-size:9px;color:${r.status==='pending'?'#ffaa00':r.status==='resolved'?'#3db83d':'#8A8A8A'}">${r.status}</span>
          </div>
        `).join('')}
      ` : '<div style="font-size:11px;color:#666;text-align:center;padding:10px">No reports against this user</div>'}
    `;
  } catch(e) {
    container.innerHTML = '<div style="font-size:11px;color:#666;text-align:center;padding:10px">Could not load report data</div>';
  }
};
