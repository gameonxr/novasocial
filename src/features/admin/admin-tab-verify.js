// adminTabVerify — extracted from index.html
// Owner SHA-256: 455d8bd3379ddbb50db628c19774ee8498ee9aa4b43d7279f8578743c5e1d836
// Classic script — exposes window.adminTabVerify

window.adminTabVerify = async function adminTabVerify(content){
  content.innerHTML = `<div style="display:flex;gap:6px;margin-bottom:12px">
    <div onclick="setVerifyFilter('pending')" id="vf-pending" style="flex:1;padding:8px;text-align:center;background:rgba(56,151,240,0.15);border:1px solid #3897f0;border-radius:10px;color:#3897f0;font-size:11px;font-weight:700;cursor:pointer">Pending</div>
    <div onclick="setVerifyFilter('approved')" id="vf-approved" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Approved</div>
    <div onclick="setVerifyFilter('rejected')" id="vf-rejected" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Rejected</div>
    <div onclick="setVerifyFilter('all')" id="vf-all" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">All</div>
  </div>
  <div id="admin-verify-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(56,151,240,0.2);border-top-color:#3897f0;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>`;
  await loadVerifyList();
};
