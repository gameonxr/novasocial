/**
 * NovaSocial Live Streaming UI feature.
 *
 * Extracted as a classic script while AI Auto-Moderation and other Nova Ultra
 * features remain inline for independent guarded checkpoints.
 */
// LIVE STREAMING UI (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
function showLiveStreamUI(){
  const m = modal('🔴 Go Live');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:14px">
      <div style="text-align:center;padding:20px 0">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#E1306C,#833AB4);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 14px;animation:novaPulse 2s infinite">🔴</div>
        <div style="font-weight:800;font-size:18px;margin-bottom:6px">Ready to Go Live?</div>
        <div style="color:#888;font-size:13px">Apne followers ke saath live connect karo. Real-time chat, reactions, aur viewer count!</div>
      </div>

      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
        <div style="font-size:12px;color:#888;font-weight:700;margin-bottom:8px">📋 LIVE SETTINGS</div>
        <input id="live-title" class="inp" placeholder="Live stream title..." style="margin-bottom:10px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#ccc;cursor:pointer">
            <input type="checkbox" checked> Enable comments
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#ccc;cursor:pointer">
            <input type="checkbox" checked> Show viewer count
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#ccc;cursor:pointer">
            <input type="checkbox"> Close friends only
          </label>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="bout" onclick="closeModal()" style="padding:14px">Cancel</button>
        <button class="bgrd" onclick="startLiveStream()" style="padding:14px">🔴 Go Live Now</button>
      </div>

      <div style="text-align:center;color:#666;font-size:11px;padding-top:8px;border-top:1px solid #1a1a1a">
        💡 Tip: Good lighting aur stable internet ke saath live karo for best experience
      </div>
    </div>
  `;
}

async function startLiveStream(){
  const title = document.getElementById('live-title')?.value || 'My Live Stream';
  closeModal();
  toast('🔴 Live starting... (Demo mode)');

  // Create live viewer UI
  const scr = document.getElementById('screen');
  const viewers = Math.floor(Math.random()*50)+10;

  scr.innerHTML = `
    <div style="position:relative;height:calc(100vh - 60px);background:#000;overflow:hidden">
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a0033,#000);display:flex;align-items:center;justify-content:center">
        <video id="live-preview" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover"></video>
      </div>

      <div class="live-badge">LIVE</div>
      <div class="live-viewers" id="live-viewers">👥 ${viewers}</div>

      <div style="position:absolute;top:50px;left:14px;right:14px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border-radius:12px;padding:10px 14px">
        <div style="font-weight:700;font-size:14px;color:#fff">${title}</div>
        <div style="font-size:11px;color:#aaa;margin-top:2px">@${PROF?.username||'user'}</div>
      </div>

      <div style="position:absolute;bottom:80px;left:0;right:0;padding:14px;max-height:200px;overflow-y:auto" id="live-chat">
        <div style="background:rgba(0,0,0,0.5);padding:8px 12px;border-radius:14px;margin-bottom:6px;font-size:13px"><b style="color:#7afdff">Nova</b> <span style="color:#fff">joined the stream 🎉</span></div>
      </div>

      <div style="position:absolute;bottom:14px;left:14px;right:14px;display:flex;gap:8px;align-items:center">
        <input id="live-cmt" placeholder="Add a comment..." style="flex:1;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:10px 16px;color:#fff;font-size:14px;outline:none">
        <button onclick="endLiveStream()" style="background:#E1306C;border:none;color:#fff;padding:10px 18px;border-radius:24px;font-weight:700;font-size:13px;cursor:pointer">End</button>
      </div>
    </div>
  `;

  // Try to access camera
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}, audio:false});
    const vid = document.getElementById('live-preview');
    if(vid){ vid.srcObject = stream; window._liveStream = stream; }
  } catch(e) {
    // Demo mode without camera
    console.log('Camera not available, demo mode');
  }

  // Simulate live viewers fluctuation
  window._liveInterval = setInterval(()=>{
    const v = document.getElementById('live-viewers');
    if(v){
      const cur = parseInt(v.textContent.match(/\d+/)[0]);
      const delta = Math.floor(Math.random()*7)-3;
      v.textContent = '👥 ' + Math.max(1, cur+delta);
    }
    // Add random chat messages
    if(Math.random() > 0.6){
      const chat = document.getElementById('live-chat');
      if(chat){
        const msgs = ['🔥🔥🔥','Nice!','Wow ❤️','Hello from Mumbai','Greetings! 👋','Awesome content','Following you now!','Keep going 🚀'];
        const names = ['Rahul','Priya','Aman','Sara','Karan','Diya','Vikram','Ananya'];
        const div = document.createElement('div');
        div.style.cssText = 'background:rgba(0,0,0,0.5);padding:8px 12px;border-radius:14px;margin-bottom:6px;font-size:13px;animation:fadeIn 0.3s';
        div.innerHTML = `<b style="color:#7afdff">${names[Math.floor(Math.random()*names.length)]}</b> <span style="color:#fff">${msgs[Math.floor(Math.random()*msgs.length)]}</span>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
      }
    }
  }, 2000);
}

function endLiveStream(){
  if(window._liveInterval) clearInterval(window._liveInterval);
  if(window._liveStream){ window._liveStream.getTracks().forEach(t=>t.stop()); }
  toast('Live ended ✓');
  go('home');
}

// ═══════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════
