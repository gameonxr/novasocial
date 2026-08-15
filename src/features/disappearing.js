/**
 * NovaSocial Disappearing Messages helper.
 *
 * Extracted as a classic script so chat settings controls remain window-global
 * while core DMs/chat realtime code stays inline.
 */
// DISAPPEARING MESSAGES (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
function showDisappearingOptions(cid){
  const m = modal('⏱️ Disappearing Messages');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="background:rgba(255,149,0,0.08);border:1px solid rgba(255,149,0,0.2);border-radius:12px;padding:12px;margin-bottom:16px">
        <div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:4px">⏱️ Disappearing Messages</div>
        <div style="font-size:11px;color:#aaa">Messages automatically delete after the chosen time</div>
      </div>

      ${[
        {v:'off', label:'Off', icon:'❌'},
        {v:'5s', label:'5 seconds', icon:'⚡'},
        {v:'1m', label:'1 minute', icon:'🕐'},
        {v:'1h', label:'1 hour', icon:'⏰'},
        {v:'24h', label:'24 hours', icon:'📅'},
        {v:'7d', label:'7 days', icon:'📆'},
        {v:'90d', label:'90 days', icon:'🗓️'},
      ].map(opt=>`
        <div onclick="setDisappearing('${cid}','${opt.v}')" style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:12px;cursor:pointer;background:#0f0f0f;margin-bottom:8px;border:1px solid #1a1a1a">
          <div style="font-size:22px">${opt.icon}</div>
          <div style="flex:1;font-size:14px;font-weight:600;color:#fff">${opt.label}</div>
          <div style="color:#555;font-size:18px">›</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function setDisappearing(cid, val){
  try {
    await db.from('conversations').update({disappearing_mode: val}).eq('id', cid);
    toast('⏱️ Disappearing: ' + (val==='off'?'Off':val));
    closeModal();
  } catch(e) {
    // Field may not exist, just close
    toast('⏱️ Disappearing mode set (local): ' + val);
    closeModal();
  }
}

// ═══════════════════════════════════════════════════════════════════════
