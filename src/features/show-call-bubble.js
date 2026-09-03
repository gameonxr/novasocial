// showCallBubble — extracted from index.html
// Owner SHA-256: b0bf70f13cea30555650f5cbd728cc46e50318a4a7a7392742a55ede843b1029
// Classic script — exposes window.showCallBubble

window.showCallBubble = function showCallBubble(){
  let bubble = document.getElementById('nova-call-bubble');
  if(bubble) bubble.remove();
  bubble = document.createElement('div');
  bubble.id = 'nova-call-bubble';
  bubble.style.cssText = 'position:fixed;top:60px;right:14px;z-index:98000;width:64px;height:64px;border-radius:50%;background:#0a0a0a;border:2px solid rgba(61,184,61,0.5);box-shadow:0 8px 24px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden';
  const name = _callState.remoteUserName || 'User';
  const avatar = _callState.remoteUserAvatar || '';
  bubble.innerHTML = avatar
    ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff">${name[0]?.toUpperCase()||'?'}</div>`;
  bubble.innerHTML += `<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.6);color:#3db83d;font-size:9px;text-align:center;padding:2px 0;font-weight:700" id="nova-call-bubble-timer">00:00</div>`;
  let dragging=false, startX=0, startY=0, origLeft=0, origTop=0, moved=false;
  bubble.addEventListener('touchstart', e=>{
    dragging=true; moved=false;
    const rect=bubble.getBoundingClientRect();
    startX=e.touches[0].clientX; startY=e.touches[0].clientY;
    origLeft=rect.left; origTop=rect.top;
  }, {passive:true});
  bubble.addEventListener('touchmove', e=>{
    if(!dragging) return;
    const dx=e.touches[0].clientX-startX, dy=e.touches[0].clientY-startY;
    if(Math.abs(dx)>5||Math.abs(dy)>5) moved=true;
    bubble.style.left=(origLeft+dx)+'px'; bubble.style.top=(origTop+dy)+'px';
    bubble.style.right='auto';
  }, {passive:true});
  bubble.addEventListener('touchend', ()=>{
    dragging=false;
    if(!moved) restoreCall();
  });
  document.body.appendChild(bubble);
};
