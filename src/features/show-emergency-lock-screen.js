// showEmergencyLockScreen — extracted from index.html
// Owner SHA-256: da248202bfd89bfb705d55f43cadd424a72cb55cbfc03e0de3c4771642c3a034
// Classic script — exposes window.showEmergencyLockScreen

window.showEmergencyLockScreen = function showEmergencyLockScreen(){
  if(document.getElementById('emergency-lock-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'emergency-lock-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:40px';
  overlay.innerHTML = `
    <div style="font-size:64px;margin-bottom:20px">🚨</div>
    <div style="font-size:24px;font-weight:800;margin-bottom:10px;color:#FF2D7A">Emergency Lock Active</div>
    <div style="font-size:14px;color:#8A8A8A;max-width:320px;line-height:1.6">NovaSocial is currently in emergency lockdown mode. All posting, messaging, and uploads are temporarily suspended. Please check back later.</div>
    <button onclick="this.parentElement.remove()" style="margin-top:30px;padding:12px 24px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;color:#fff;font-weight:600;cursor:pointer">Refresh Check</button>
  `;
  document.body.appendChild(overlay);
};
