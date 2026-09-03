// _showNewMessagePill — extracted from index.html
// Owner SHA-256: af4de0505fadc322e12a802074241fe41e85cb801aa5d2e85d2a59f97cd6ca86
// Classic script — exposes window._showNewMessagePill

window._showNewMessagePill = function _showNewMessagePill(cid, isGrp, list){
  // Remove existing pill if any (avoid stacking)
  const existing = document.getElementById('nova-new-msg-pill');
  if(existing) return; // already showing — don't stack

  const pill = document.createElement('div');
  pill.id = 'nova-new-msg-pill';
  pill.style.cssText = 'position:sticky;bottom:12px;left:50%;transform:translateX(-50%);background:#FF2D7A;color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:20px;box-shadow:0 4px 16px rgba(225,48,108,0.4);cursor:pointer;z-index:100;display:flex;align-items:center;gap:6px;animation:novaFadeIn 0.3s ease;width:fit-content;margin:0 auto;';
  pill.innerHTML = 'New message <span style="font-size:14px">↓</span>';

  pill.onclick = () => {
    pill.remove();
    loadMsgs(cid, isGrp); // full reload to 50 most recent + scroll to bottom
  };

  // Append to the message list (sticky positioning keeps it visible at bottom of viewport)
  list.appendChild(pill);

  // Auto-remove after 15 seconds if user doesn't tap (don't leave stale pills)
  setTimeout(() => {
    if(pill && pill.parentNode) pill.remove();
  }, 15000);
};
