// showCallScreen — extracted from index.html
// Owner SHA-256: 669570bee211d722ab7895fac35e430ecb7c1df60310982597acfee636d03643
// Classic script — exposes window.showCallScreen

window.showCallScreen = function showCallScreen() {
  let screen = document.getElementById('nova-call-screen');
  if (!screen) { screen = document.createElement('div'); screen.id = 'nova-call-screen'; document.body.appendChild(screen); }
  const isVideo = _callState.callType === 'video';
  const name = _callState.remoteUserName || 'User';
  const avatar = _callState.remoteUserAvatar || '';

  screen.innerHTML = `
    <div class="${!isVideo ? 'call-bg-animated' : ''}" style="position:absolute;inset:0;overflow:hidden">
      ${isVideo ? `<video id="nova-call-remote-video" autoplay playsinline style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1)"></video>`
        : ``}
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.55) 100%)"></div>
    </div>
    <audio id="nova-call-remote-audio" autoplay playsinline></audio>

    <!-- ═══ TOP BAR — Single unified row, no overlap ═══ -->
    <div class="call-slide-in" style="position:relative;z-index:4;width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 16px 0;gap:8px">

      <!-- Left: Minimize -->
      <div onclick="minimizeCall()" style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);flex-shrink:0">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>
      </div>

      <!-- Center: Network status -->
      <div id="nova-call-network-indicator" style="display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.08);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:7px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0">${getNetworkQualityHTML()}<span style="font-size:11px;color:rgba(255,255,255,0.65);font-weight:600;letter-spacing:0.2px">Connecting</span></div>

      <!-- Right: Add member (audio only) OR PiP toggle (video only) -->
      ${!isVideo
        ? `<div onclick="showAddToCallMenu()" style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);flex-shrink:0"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg></div>`
        : `<div onclick="enableCallPiP()" title="Floating window mode" style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);flex-shrink:0"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="13" y="11" width="7" height="5" rx="1" fill="white" stroke="none"/></svg></div>`
      }
    </div>

    <!-- ═══ CENTER — Avatar + Name + Status (sirf connecting state mein, video call mein auto-hide hoga) ═══ -->
    <div id="nova-call-center-info" class="call-slide-in" style="position:relative;z-index:2;text-align:center;padding:28px 20px 20px;transition:opacity 0.3s ease">
      <div style="margin-bottom:22px" class="call-avatar-breathe">
        <div class="call-avatar-ring" style="width:116px;height:116px;border-radius:50%;background:linear-gradient(135deg,#FF2D7A,#833AB4,#00E5FF);padding:3px;margin:0 auto;box-shadow:0 12px 40px rgba(225,48,108,0.4)">
          <div style="width:100%;height:100%;border-radius:50%;border:3px solid #000;overflow:hidden;background:#111">
            ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a1a,#0a0a0a);display:flex;align-items:center;justify-content:center;font-size:46px;font-weight:800;color:#fff">${name[0]?.toUpperCase() || '?'}</div>`}
          </div>
        </div>
      </div>
      <div style="font-weight:800;font-size:25px;color:#fff;margin-bottom:8px;letter-spacing:-0.4px">${name}</div>
      <div id="nova-call-status" style="font-size:14px;color:rgba(255,255,255,0.6);font-weight:500;letter-spacing:0.1px">${_callState.isOutgoing ? 'Calling...' : 'Connecting...'}</div>
      <div id="nova-call-timer" style="font-size:15px;color:#fff;margin-top:10px;display:none;font-weight:700;font-variant-numeric:tabular-nums;background:rgba(61,184,61,0.18);padding:5px 16px;border-radius:16px;border:1px solid rgba(61,184,61,0.25)">00:00</div>
    </div>

    <!-- ═══ Compact name badge — sirf tab dikhta hai jab video call CONNECTED ho ═══ -->
    ${isVideo ? `
    <div id="nova-call-compact-badge" style="display:none;position:absolute;top:74px;left:16px;z-index:2;background:rgba(0,0,0,0.5);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:8px 14px 8px 8px;border-radius:24px;align-items:center;gap:8px;border:1px solid rgba(255,255,255,0.1)">
      <div style="width:26px;height:26px;border-radius:50%;overflow:hidden;flex-shrink:0;background:#222">
        ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff">${name[0]?.toUpperCase() || '?'}</div>`}
      </div>
      <span style="color:#fff;font-size:13px;font-weight:700">${name}</span>
      <span id="nova-call-compact-timer" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums"></span>
    </div>` : ''}

    <!-- ═══ LOCAL VIDEO PREVIEW (video calls only, positioned BELOW top bar to avoid overlap) ═══ -->
    ${isVideo ? `
    <div id="nova-call-local-wrap" class="call-slide-in" style="position:absolute;top:74px;right:16px;width:100px;height:146px;border-radius:20px;overflow:hidden;border:2px solid rgba(255,255,255,0.2);z-index:3;box-shadow:0 12px 32px rgba(0,0,0,0.5)">
      <video id="nova-call-local-video" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1)"></video>
      <div onclick="event.stopPropagation();switchCallCamera()" style="position:absolute;bottom:7px;right:7px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid rgba(255,255,255,0.18)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
      </div>
    </div>` : ''}

    <!-- ═══ BOTTOM CONTROLS — Premium uniform grid ═══ -->
    <div class="call-slide-in" style="position:relative;z-index:2;padding:0 24px 44px">
      ${isVideo ? `
      <div style="display:flex;justify-content:center;margin-bottom:22px">
        <button id="nova-call-video-btn" class="call-btn-press" onclick="toggleCallVideo()" style="display:flex;align-items:center;gap:7px;padding:10px 20px;border-radius:24px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);cursor:pointer;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          <span style="color:#fff;font-size:13px;font-weight:600;letter-spacing:0.1px">Camera</span>
        </button>
      </div>` : ''}

      <!-- Uniform grid: 4 columns, equal width, buttons centered within each -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);align-items:end;gap:4px">

        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <button class="call-btn-press" onclick="showCallMoreMenu()" style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="white"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>
          </button>
          <span style="color:rgba(255,255,255,0.55);font-size:11.5px;font-weight:600">More</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <button id="nova-call-mute-btn" class="call-btn-press" onclick="toggleCallMute()" style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.1);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <span style="color:rgba(255,255,255,0.55);font-size:11.5px;font-weight:600">Mute</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <button class="call-btn-press" onclick="endCall()" style="width:66px;height:66px;border-radius:50%;background:linear-gradient(135deg,#FF2D7A,#E1306C);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px rgba(225,48,108,0.5);margin:0 auto -4px">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11 21 3 13 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" transform="rotate(135 12 12)"/></svg>
          </button>
          <span style="color:rgba(255,255,255,0.55);font-size:11.5px;font-weight:600">End</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <button id="nova-call-speaker-btn" class="call-btn-press" onclick="toggleCallSpeaker()" style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.1);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
          </button>
          <span style="color:rgba(255,255,255,0.55);font-size:11.5px;font-weight:600">Speaker</span>
        </div>

      </div>
    </div>`;
  screen.classList.add('show');
  startNetworkMonitor();
};
