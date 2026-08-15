/**
 * NovaSocial Voice Rooms feature.
 *
 * Extracted as a classic script; its localStorage-backed room handlers remain
 * window-global while Functional Calendar stays inline.
 */
// ── VOICE ROOMS (Functional) ──────────────────────────────────────
function showVoiceRooms(){
  const m = modal('🎙️ Voice Rooms');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div style="font-weight:700;font-size:15px">🎙️ Voice Rooms</div>
          <div style="font-size:11px;color:#666">Real-time audio conversations</div>
        </div>
        <button onclick="createVoiceRoom()" class="bgrd" style="padding:8px 14px;font-size:12px;width:auto;border-radius:10px">+ Start</button>
      </div>

      ${[
        {name:'Tech Talk Tuesday', host:'@rahul_dev', listeners:45, live:true, topic:'💻 Flutter vs React Native'},
        {name:'Gaming Night', host:'@aman_gamer', listeners:128, live:true, topic:'🎮 Valorant Tournament Discussion'},
        {name:'Coffee & Code', host:'@priya_codes', listeners:23, live:false, topic:'💻 Morning coding session'},
        {name:'Music Lovers', host:'@sara_sings', listeners:67, live:true, topic:'🎵 Indie music discussion'},
        {name:'Travel Stories', host:'@vikram_travels', listeners:34, live:false, topic:'✈️ Himachal trip stories'},
      ].map(r => `
        <div style="padding:14px;background:#0f0f0f;border-radius:14px;margin-bottom:10px;border:1px solid #1a1a1a">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="font-weight:700;font-size:14px">🎙️ ${r.name}</div>
            ${r.live?'<div style="background:#E1306C;color:#fff;font-size:10px;padding:3px 8px;border-radius:6px;font-weight:700;display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#fff;animation:novaPulse 1s infinite"></span>LIVE</div>':'<div style="background:#222;color:#888;font-size:10px;padding:3px 8px;border-radius:6px">ENDED</div>'}
          </div>
          <div style="font-size:12px;color:#888;margin-bottom:4px">📍 ${r.topic}</div>
          <div style="font-size:11px;color:#666;margin-bottom:10px">Hosted by ${r.host} • 👥 ${r.listeners} listening</div>
          ${r.live?`<button onclick="joinVoiceRoom('${r.name}')" class="bgrd" style="width:100%;padding:10px;font-size:12px;border-radius:10px">🎧 Join Room</button>`:''}
        </div>
      `).join('')}
    </div>
  `;
}

function createVoiceRoom(){
  const name = prompt('Voice room topic:');
  if(!name?.trim()) return;
  toast(`🎙️ Voice room "${name}" starting...`);
  closeModal();
  setTimeout(() => {
    joinVoiceRoom(name);
  }, 500);
}

function joinVoiceRoom(name){
  const m = modal(`🎧 ${name}`);
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <!-- Active Speakers -->
      <div style="background:linear-gradient(135deg,rgba(122,253,255,0.08),rgba(252,0,124,0.08));border:1px solid rgba(122,253,255,0.2);border-radius:14px;padding:16px;margin-bottom:14px">
        <div style="font-size:11px;color:#7afdff;font-weight:700;margin-bottom:12px">🎙️ SPEAKERS</div>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          ${[
            {name:'@rahul_dev', speaking:true},
            {name:'@priya_codes', speaking:false},
          ].map(s => `
            <div style="text-align:center">
              <div style="position:relative;width:56px;height:56px;margin:0 auto 6px">
                <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7afdff,#fc007c);display:flex;align-items:center;justify-content:center;font-size:22px">${s.speaking?'🎤':'👤'}</div>
                ${s.speaking?'<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid #3db83d;animation:novaPulse 1.5s infinite"></div>':''}
              </div>
              <div style="font-size:10px;color:#fff;font-weight:600">${s.name}</div>
              <div style="font-size:9px;color:${s.speaking?'#3db83d':'#666'}">${s.speaking?'speaking':'silent'}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Listeners -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:14px">
        <div style="font-size:11px;color:#666;font-weight:700;margin-bottom:10px">👥 LISTENERS (23)</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${Array.from({length: 8}, (_, i) => `
            <div style="width:32px;height:32px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:14px">${['👤','👨','👩','🧑','👦','👧','🧒','👶'][i]}</div>
          `).join('')}
          <div style="width:32px;height:32px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666">+15</div>
        </div>
      </div>

      <!-- Controls -->
      <div style="display:flex;justify-content:center;gap:14px;padding:14px;background:#0f0f0f;border-radius:14px;border:1px solid #1a1a1a">
        <button onclick="this.style.background=this.style.background==='rgb(225, 48, 108)'?'#1a1a1a':'#E1306C';toast('🎤 Mic toggled')" style="width:54px;height:54px;border-radius:50%;background:#1a1a1a;border:1px solid #333;display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('mic','#fff',22)}</button>
        <button onclick="toast('Headphones toggled')" style="width:54px;height:54px;border-radius:50%;background:#1a1a1a;border:1px solid #333;display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('headphones','#fff',22)}</button>
        <button onclick="closeModal();toast('Left voice room')" style="width:54px;height:54px;border-radius:50%;background:#E1306C;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('logout','#fff',22)}</button>
      </div>

      <div style="font-size:11px;color:#666;text-align:center;margin-top:12px">
        💡 Tip: Use headphones for best experience. Be respectful to other speakers.
      </div>
    </div>
  `;
}
