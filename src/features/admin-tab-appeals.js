// adminTabAppeals — extracted from index.html
// Owner SHA-256: 7866037c47f28c61cc2053bbad51f661275718c1f70181c6d276d69c222053b1
// Classic script — exposes window.adminTabAppeals

window.adminTabAppeals = async function adminTabAppeals(content){
  content.innerHTML = `<div style="display:flex;gap:6px;margin-bottom:12px">
    <div onclick="setAppealsFilter('pending')" id="apf-pending" style="flex:1;padding:8px;text-align:center;background:rgba(255,136,0,0.15);border:1px solid #ff8800;border-radius:10px;color:#ff8800;font-size:11px;font-weight:700;cursor:pointer">Pending</div>
    <div onclick="setAppealsFilter('approved')" id="apf-approved" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Approved</div>
    <div onclick="setAppealsFilter('rejected')" id="apf-rejected" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Rejected</div>
    <div onclick="setAppealsFilter('all')" id="apf-all" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">All</div>
  </div>
  <div id="admin-appeals-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(255,136,0,0.2);border-top-color:#ff8800;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>`;
  await loadAppealsList();
};
