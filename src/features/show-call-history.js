// showCallHistory — extracted from index.html
// Owner SHA-256: 75b945231519cf4c511a805467e4c2ac0b74cfa3f0fd5887f0b9b22700a95913
// Classic script — exposes window.showCallHistory

window.showCallHistory = async function showCallHistory(otherUserId){
  const m = modal('📞 Call History');
  const body = m.querySelector('#mbody');
  body.innerHTML = '<div class="ldiv"><div class="spin"></div></div>';
  const { data: calls } = await db.from('calls')
    .select('*, caller:profiles!calls_caller_id_fkey(username,avatar_url), callee:profiles!calls_callee_id_fkey(username,avatar_url)')
    .or(`and(caller_id.eq.${ME.id},callee_id.eq.${otherUserId}),and(caller_id.eq.${otherUserId},callee_id.eq.${ME.id})`)
    .order('created_at', { ascending: false })
    .limit(50);
  if(!calls?.length){
    body.innerHTML = '<div style="text-align:center;padding:40px;color:#555">Koi call history nahi hai</div>';
    return;
  }
  body.innerHTML = calls.map(c => {
    const isOutgoing = c.caller_id === ME.id;
    const otherProf = isOutgoing ? c.callee : c.caller;
    const otherId = isOutgoing ? c.callee_id : c.caller_id;
    const isMissedOrRejected = c.status === 'missed' || c.status === 'rejected';
    const statusColor = isMissedOrRejected ? '#E1306C' : '#3db83d';
    const arrowSvg = isOutgoing
      ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="'+statusColor+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H9M17 7V15"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="'+statusColor+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7L7 17M7 17H15M7 17V9"/></svg>';
    const typeSvg = c.call_type === 'video'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
    const durText = c.duration_seconds > 0 ? Math.floor(c.duration_seconds/60)+':'+String(c.duration_seconds%60).padStart(2,'0') : '';
    const uname = (otherProf?.username||'').replace(/'/g,"\\'");
    const ava = otherProf?.avatar_url || '';
    const ctype = c.call_type === 'video' ? 'video' : 'audio';
    return `<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #0d0d0d">
      ${av(otherProf?.avatar_url, otherProf?.username, 42)}
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:6px"><span style="display:inline-flex">${arrowSvg}</span><span style="font-weight:700;font-size:14px;color:#fff">${otherProf?.username || 'User'}</span></div>
        <div style="display:flex;align-items:center;gap:5px;margin-top:3px"><span style="display:inline-flex">${typeSvg}</span><span style="color:#777;font-size:12px">${isMissedOrRejected ? (c.status === 'missed' ? 'Missed' : 'Declined') : (isOutgoing ? 'Outgoing' : 'Incoming')}${durText ? ' · '+durText : ''}</span></div>
      </div>
      <div style="color:#555;font-size:11px">${ago(c.created_at)}</div>
      <div onclick="initiateCall('${otherId}','${uname}','${ava}','${ctype}')" style="cursor:pointer;padding:6px">${ico(c.call_type === 'video' ? 'video' : 'phone', '#3db83d', 18)}</div>
    </div>`;
  }).join('');
};
