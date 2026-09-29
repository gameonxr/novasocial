// showCallMoreMenu — extracted from index.html
// Owner SHA-256: 55901be0ec4717f251cfc653d77f55b339a20b67e060a8fff3d712ccba7c394b
// Classic script — exposes window.showCallMoreMenu

window.showCallMoreMenu = function showCallMoreMenu(){
  const m = modal('Call Options');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:8px 0">
    <button onclick="toast('Screen share jaldi aa raha hai 🚀');closeModal()" style="width:100%;padding:16px 20px;background:transparent;border:none;border-bottom:1px solid #1a1a1a;color:#fff;font-size:15px;text-align:left;display:flex;align-items:center;gap:14px;cursor:pointer">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      Share Screen <span style="margin-left:auto;color:#555;font-size:11px">Coming Soon</span>
    </button>
    <button onclick="closeModal();minimizeCall();go('dms');" style="width:100%;padding:16px 20px;background:transparent;border:none;color:#fff;font-size:15px;text-align:left;display:flex;align-items:center;gap:14px;cursor:pointer">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      Send Message
    </button>
  </div>`;
};
