// showBanScreen — extracted from index.html
// Owner SHA-256: 49a086aea49a2d8240f038f24d0697738b494a87366d7fc9bbe0960e3d6d49a1
// Classic script — exposes window.showBanScreen

window.showBanScreen = function showBanScreen(reason, userId){
  const banMsg = document.createElement('div');
  banMsg.id = 'ban-screen';
  banMsg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;padding:30px';
  banMsg.innerHTML = `<div style="text-align:center;max-width:340px">
    <div style="font-size:60px;margin-bottom:16px">${ico('lock','#FF2D7A',60)}</div>
    <div style="color:#FF2D7A;font-weight:800;font-size:20px;margin-bottom:10px">Account Suspended</div>
    <div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:8px">Your account has been suspended.</div>
    <div style="color:#8A8A8A;font-size:12px;margin-bottom:6px">Reason: ${esc(reason)}</div>
    <div style="color:#555;font-size:11px;margin-bottom:20px">If you believe this is a mistake, you can appeal.</div>
    <div style="display:flex;gap:10px;justify-content:center">
      <button onclick="showAppealForm('${userId}')" style="padding:10px 20px;background:linear-gradient(135deg,#FF2D7A,#833AB4);border:none;border-radius:10px;color:#fff;font-weight:700;cursor:pointer">Appeal</button>
      <button onclick="signOutBanned()" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#8A8A8A;font-weight:700;cursor:pointer">OK</button>
    </div>
  </div>`;
  document.body.appendChild(banMsg);
};
