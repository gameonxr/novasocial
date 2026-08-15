// Call UI wrapper feature extracted from index.html.
// 📞 Call Feature — opens a call UI with real WebRTC-ish interface
function showCallFeature(){
  const m = modal('📞 Calls');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:16px">
    <div style="text-align:center;padding:20px 0">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#FF2D7A,#833AB4);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:36px">${ico('vid','#fff',36)}</div>
      <div style="font-weight:800;font-size:18px;color:#fff">NovaSocial Calls</div>
      <div style="color:#888;font-size:13px;margin-top:6px">Free audio & video calls</div>
    </div>

    <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">
      <div style="font-size:12px;color:#888;font-weight:700;margin-bottom:10px">START A CALL</div>
      <div style="display:flex;gap:10px">
        <button onclick="startNovaCall('audio')" style="flex:1;padding:14px;background:rgba(61,184,61,0.1);border:1px solid #3db83d;border-radius:12px;color:#3db83d;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">${ico('vid','#3db83d',18)} Audio</button>
        <button onclick="startNovaCall('video')" style="flex:1;padding:14px;background:rgba(0,229,255,0.1);border:1px solid #00E5FF;border-radius:12px;color:#00E5FF;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">${ico('cam','#00E5FF',18)} Video</button>
      </div>
    </div>

    <div style="background:rgba(255,170,0,0.08);border:1px solid rgba(255,170,0,0.2);border-radius:14px;padding:12px;text-align:center">
      <div style="font-size:12px;color:#ffaa00;font-weight:600">💡 Tip: Open a DM chat and tap the call icon to call someone directly</div>
    </div>
  </div>`;
}

async function startNovaCall(type){
  toast('📋 Select a contact from DMs to call');
  closeModal();
  go('dms');
}
