/**
 * NovaSocial Functional Learning feature.
 *
 * Extracted as a classic script so course navigation and inline handlers
 * remain window-global while News Feed stays inline.
 */
// ── FUNCTIONAL LEARNING ──────────────────────────────────────
function showLearning(){
  const m = modal('🎓 Learning');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="font-weight:700;font-size:15px;margin-bottom:14px">🎓 Learning Hub</div>

      <div style="background:linear-gradient(135deg,rgba(0,149,246,0.1),rgba(168,85,247,0.1));border:1px solid rgba(0,149,246,0.2);border-radius:14px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;font-size:13px;color:#fff;margin-bottom:4px">📚 Continue Learning</div>
        <div style="font-size:11px;color:#aaa">Pick up where you left off</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          {title:'Flutter Basics', lessons:24, progress:60, icon:'💙', color:'linear-gradient(135deg,#0095f6,#00d4ff)'},
          {title:'Python Mastery', lessons:40, progress:25, icon:'🐍', color:'linear-gradient(135deg,#3db83d,#00ddff)'},
          {title:'UI/UX Design', lessons:18, progress:80, icon:'🎨', color:'linear-gradient(135deg,#a855f7,#ec4899)'},
          {title:'Digital Marketing', lessons:32, progress:0, icon:'📈', color:'linear-gradient(135deg,#f7931e,#ffcc00)'},
          {title:'AI & ML Basics', lessons:50, progress:10, icon:'🤖', color:'linear-gradient(135deg,#E1306C,#833AB4)'},
          {title:'Content Creation', lessons:20, progress:45, icon:'🎬', color:'linear-gradient(135deg,#ff3030,#ff6b35)'},
        ].map(c => `
          <div onclick="startCourse('${c.title}')" style="background:#0f0f0f;border-radius:14px;overflow:hidden;cursor:pointer;border:1px solid #1a1a1a">
            <div style="aspect-ratio:16/9;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:32px;position:relative">
              ${c.icon}
              ${c.progress > 0 ? `<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.2)"><div style="height:100%;width:${c.progress}%;background:#fff"></div></div>` : ''}
            </div>
            <div style="padding:10px">
              <div style="font-weight:600;font-size:12px;color:#fff">${c.title}</div>
              <div style="font-size:10px;color:#666;margin-top:2px">${c.lessons} lessons • ${c.progress}% done</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function startCourse(title){
  toast(`🎓 Starting "${title}"... Lesson 1 loading!`);
  closeModal();
}
