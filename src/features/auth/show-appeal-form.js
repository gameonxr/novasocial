// showAppealForm — extracted from index.html
// Owner SHA-256: 607017c5f75ff5a586563abc13fc77f45d10f6ddb5c8f4acbb1a4fbff5d26aee
// Classic script — exposes window.showAppealForm

window.showAppealForm = function showAppealForm(userId){
  const banScreen = document.getElementById('ban-screen');
  if(banScreen) banScreen.remove();
  const m = modal('Appeal Ban');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:16px;display:flex;flex-direction:column;gap:14px">
    <div style="text-align:center;padding:10px 0">
      <div style="font-weight:800;font-size:18px">Appeal Your Ban</div>
      <div style="color:#888;font-size:13px;margin-top:6px">Explain why your account should be restored</div>
    </div>
    <div>
      <div style="color:#666;font-size:12px;margin-bottom:6px;font-weight:600">Why should we unban you? (required)</div>
      <textarea id="appeal-reason" class="inp" rows="4" placeholder="Explain your side..." style="resize:none;line-height:1.5"></textarea>
    </div>
    <button onclick="submitBanAppeal('${userId}')" class="bgrd" style="padding:14px">Submit Appeal</button>
    <button onclick="closeModal()" class="bout" style="padding:12px">Cancel</button>
  </div>`;
};
