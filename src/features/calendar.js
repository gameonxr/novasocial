/**
 * NovaSocial Functional Calendar display feature.
 *
 * Extracted as a classic script; the existing inline addCalendarEvent helper
 * remains in place because it follows the Notes section boundary.
 */
// ── FUNCTIONAL CALENDAR ──────────────────────────────────────
function showCalendar(){
  const m = modal('📅 Calendar');
  const body = m.querySelector('#mbody');
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let daysHtml = '';
  for(let i = 0; i < firstDay; i++){
    daysHtml += '<div></div>';
  }
  for(let d = 1; d <= daysInMonth; d++){
    const isToday = d === today.getDate();
    daysHtml += `<div onclick="toast('📅 ${d} ${monthNames[month]} ${year}')" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;border-radius:8px;${isToday?'background:linear-gradient(135deg,#833AB4,#E1306C);color:#fff;font-weight:700':'color:#ccc'}">${d}</div>`;
  }

  body.innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-weight:700;font-size:16px">${monthNames[month]} ${year}</div>
        <div style="display:flex;gap:8px">
          <button class="bout" style="padding:6px 10px;font-size:12px;width:auto">‹</button>
          <button class="bout" style="padding:6px 10px;font-size:12px;width:auto">›</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">
        ${['S','M','T','W','T','F','S'].map(d => `<div style="text-align:center;font-size:11px;color:#666;font-weight:700;padding:4px">${d}</div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${daysHtml}</div>

      <div style="margin-top:16px">
        <div style="font-size:11px;color:#666;font-weight:700;margin-bottom:10px">UPCOMING EVENTS</div>
        ${[
          {date:'Tomorrow', title:'Team Meeting', time:'10:00 AM', color:'#0095f6'},
          {date:'Fri, 5 Jul', title:'Flutter Workshop', time:'4:00 PM', color:'#a855f7'},
          {date:'Sun, 7 Jul', title:'Gaming Tournament', time:'8:00 PM', color:'#E1306C'},
        ].map(e => `
          <div style="display:flex;gap:12px;padding:12px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;border:1px solid #1a1a1a;border-left:3px solid ${e.color}">
            <div style="flex:1">
              <div style="font-weight:600;font-size:13px;color:#fff">${e.title}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">${e.date} • ${e.time}</div>
            </div>
            <button onclick="toast('Reminder set!')" class="bout" style="padding:6px 10px;font-size:10px;width:auto;align-self:center">🔔</button>
          </div>
        `).join('')}
        <button onclick="addCalendarEvent()" class="bout" style="width:100%;padding:10px;margin-top:8px">+ Add Event</button>
      </div>
    </div>
  `;
}
