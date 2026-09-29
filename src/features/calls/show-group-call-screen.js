// showGroupCallScreen — extracted from index.html
// Owner SHA-256: 254338eef98eb7b406ad6f7412e6b67d880300888f9ac56fe75867c3f05f25b3
// Classic script — exposes window.showGroupCallScreen

window.showGroupCallScreen = function showGroupCallScreen() {
  let screen = document.getElementById('nova-call-screen');
  if (!screen) { screen = document.createElement('div'); screen.id = 'nova-call-screen'; document.body.appendChild(screen); }

  screen.innerHTML = `
    <div class="call-bg-animated" style="position:absolute;inset:0"></div>
    <div style="position:relative;z-index:2;text-align:center;padding:16px 20px 8px">
      <div style="font-weight:800;font-size:16px;color:#fff">Group Call</div>
      <div id="gc-participant-count" style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px">1 in call</div>
    </div>
    <div id="group-call-grid" style="position:relative;z-index:2;flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:12px 16px;overflow-y:auto;align-content:start"></div>
    <div style="position:relative;z-index:2;padding:0 20px 40px">
      <div style="display:flex;justify-content:center;gap:16px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <button id="gc-mute-btn" class="call-btn-press" onclick="toggleGroupMute()" style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
          <span style="color:rgba(255,255,255,0.6);font-size:11px">Mute</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <button class="call-btn-press" onclick="leaveGroupCall()" style="width:70px;height:70px;border-radius:50%;background:#E1306C;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(225,48,108,0.5)"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11 21 3 13 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" transform="rotate(135 12 12)"/></svg></button>
          <span style="color:rgba(255,255,255,0.6);font-size:11px">Leave</span>
        </div>
        ${_groupCallState.callType === 'video' ? `
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <button id="gc-video-btn" class="call-btn-press" onclick="toggleGroupVideo()" style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg></button>
          <span style="color:rgba(255,255,255,0.6);font-size:11px">Camera</span>
        </div>` : ''}
      </div>
    </div>`;
  screen.classList.add('show');
};
