// adminTabReports — extracted from index.html
// Owner SHA-256: e6ce32500df19e139b0d314b211fd0bd2e8d1cfdf8ec703a8a59d453cf541fad
// Classic script — exposes window.adminTabReports

window.adminTabReports = async function adminTabReports(content){
  content.innerHTML = `<div style="display:flex;gap:6px;margin-bottom:12px">
    <div onclick="setReportsFilter('pending')" id="rf-pending" style="flex:1;padding:8px;text-align:center;background:rgba(255,170,0,0.15);border:1px solid #ffaa00;border-radius:10px;color:#ffaa00;font-size:11px;font-weight:700;cursor:pointer">Pending</div>
    <div onclick="setReportsFilter('resolved')" id="rf-resolved" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Resolved</div>
    <div onclick="setReportsFilter('dismissed')" id="rf-dismissed" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Dismissed</div>
    <div onclick="setReportsFilter('all')" id="rf-all" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">All</div>
  </div>
  <div id="admin-reports-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>`;
  await loadReportsList();
};
