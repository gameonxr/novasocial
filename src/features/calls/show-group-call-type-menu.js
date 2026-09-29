// showGroupCallTypeMenu — extracted from index.html
// Owner SHA-256: 9115f834601a5312187553fee476b4d5f60a5558660ef3d0ca8e84a940f1b6b2
// Classic script — exposes window.showGroupCallTypeMenu

window.showGroupCallTypeMenu = function showGroupCallTypeMenu(cid) {
  const m = modal('Start Group Call');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:20px;display:flex;gap:14px;justify-content:center">
    <button onclick="closeModal();initiateGroupCall('${cid}','audio')" style="flex:1;padding:20px;background:rgba(61,184,61,0.1);border:1px solid rgba(61,184,61,0.3);border-radius:16px;color:#3db83d;font-weight:700;cursor:pointer">📞 Audio</button>
    <button onclick="closeModal();initiateGroupCall('${cid}','video')" style="flex:1;padding:20px;background:rgba(0,229,255,0.1);border:1px solid rgba(0,229,255,0.3);border-radius:16px;color:#00E5FF;font-weight:700;cursor:pointer">📹 Video</button>
  </div>`;
};
