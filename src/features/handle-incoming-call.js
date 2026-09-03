// handleIncomingCall — extracted from index.html
// Owner SHA-256: 9541b083f7888edf2adc3fec2562855b582606ac40f87796eafb4e07af6a68cc
// Classic script — exposes window.handleIncomingCall

window.handleIncomingCall = async function handleIncomingCall(callData) {
  if (_callState.active) { await db.from('calls').update({ status: 'rejected' }).eq('id', callData.id); return; }
  const { data: callerProf } = await db.from('profiles').select('username, avatar_url, full_name').eq('id', callData.caller_id).single();
  if (!callerProf) return;
  const banner = document.getElementById('nova-incoming-call') || createIncomingCallBanner();
  const typeIcon = callData.call_type === 'video' ? '📹' : '📞';
  const typeText = callData.call_type === 'video' ? 'Video Call' : 'Audio Call';
  banner.innerHTML = '<div style="position:relative;flex-shrink:0">' + av(callerProf.avatar_url, callerProf.username, 48) + '<div style="position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#3db83d;border:2px solid #0A0A0A;display:flex;align-items:center;justify-content:center;font-size:10px" class="call-ringing-icon">' + typeIcon + '</div></div><div style="flex:1;min-width:0"><div style="font-weight:800;font-size:14px;color:#fff">' + (callerProf.full_name || callerProf.username) + '</div><div style="font-size:12px;color:#888;margin-top:2px">Incoming ' + typeText + '...</div></div><div style="display:flex;gap:10px;flex-shrink:0"><button onclick="rejectIncomingCall(\'' + callData.id + '\')" style="width:46px;height:46px;border-radius:50%;background:#E1306C;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M6.67 3.89L4.44 1.66A1 1 0 003 1.66l-1.4 1.4a1 1 0 000 1.42l2.27 2.27C5.16 8.1 6 10.01 6 12s-.84 3.9-2.13 5.25l-2.27 2.27a1 1 0 000 1.42l1.4 1.4a1 1 0 001.44 0L6.67 20.1C8.59 18.39 10 15.35 10 12s-1.41-6.39-3.33-8.11z"/></svg></button><button onclick="acceptIncomingCall(\'' + callData.id + '\',\'' + callData.caller_id + '\',\'' + (callerProf.username||'').replace(/'/g,"\\'") + '\',\'' + (callerProf.avatar_url||'') + '\',\'' + callData.call_type + '\')" style="width:46px;height:46px;border-radius:50%;background:#3db83d;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer" class="call-avatar-ring"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11 21 3 13 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg></button></div>';
  banner.classList.add('show');
  if (window._incomingCallTimeout) clearTimeout(window._incomingCallTimeout);
  window._incomingCallTimeout = setTimeout(async () => { console.log('%c[CALL] 30s timeout fired — marking as missed', 'color:yellow;font-weight:bold'); dismissIncomingCallBanner(); await db.from('calls').update({ status: 'missed' }).eq('id', callData.id); }, 30000);
  try { navigator.vibrate([400, 200, 400, 200, 400]); } catch(e) {}
  playRingtone();
};
