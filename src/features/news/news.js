/**
 * NovaSocial Functional News Feed feature.
 *
 * Extracted as a classic script while Games and the later showNewsFeed
 * implementation remain inline for independent guarded checkpoints.
 */
// ── FUNCTIONAL NEWS FEED ──────────────────────────────────────
function showNews(){
  const m = modal('📰 News');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="font-weight:700;font-size:15px;margin-bottom:14px">📰 Personalized News</div>

      <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-bottom:14px">
        ${['For You','Tech','Gaming','Sports','Entertainment','Business','Science','Health'].map((c,i) => `<div style="flex-shrink:0;padding:6px 14px;background:${i===0?'#fff':'#1a1a1a'};color:${i===0?'#000':'#888'};border-radius:14px;font-size:12px;font-weight:600;cursor:pointer">${c}</div>`).join('')}
      </div>

      ${[
        {title:'Flutter 4.0 released with new features', source:'TechCrunch', time:'2h ago', img:'💙', color:'linear-gradient(135deg,#0095f6,#00d4ff)'},
        {title:'Valorant World Cup 2026 announced', source:'ESPN', time:'4h ago', img:'🎮', color:'linear-gradient(135deg,#ff3030,#ff6b35)'},
        {title:'AI breakthrough in healthcare', source:'BBC', time:'6h ago', img:'🤖', color:'linear-gradient(135deg,#a855f7,#ec4899)'},
        {title:'New SpaceX mission successful', source:'Space.com', time:'8h ago', img:'🚀', color:'linear-gradient(135deg,#000,#333)'},
        {title:'Bitcoin crosses $80k mark', source:'CoinDesk', time:'10h ago', img:'₿', color:'linear-gradient(135deg,#f7931e,#ffcc00)'},
      ].map(n => `
        <div onclick="toast('Opening article...')" style="display:flex;gap:12px;padding:12px;background:#0f0f0f;border-radius:14px;margin-bottom:10px;cursor:pointer;border:1px solid #1a1a1a">
          <div style="width:80px;height:80px;border-radius:10px;background:${n.color};display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0">${n.img}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px;color:#fff;line-height:1.4">${n.title}</div>
            <div style="font-size:11px;color:#666;margin-top:6px">${n.source} • ${n.time}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
