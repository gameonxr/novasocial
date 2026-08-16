// Reply preview UI helpers used by chat message actions.
function replyMsg(id, text, name, mediaType, mediaUrl) {
  window.replyToId=id;
  const box=document.getElementById('reply-preview');
  if(!box) return;
  box.style.display='block';

  let previewContent = text;
  if(!text && mediaUrl) {
    if(mediaType === 'image') previewContent = '📷 Photo';
    else if(mediaType === 'video') previewContent = '🎬 Video';
    else if(mediaType === 'audio') previewContent = '🎤 Voice Message';
  }

  let html = '<div style="display:flex;justify-content:space-between;align-items:center;background:#111;padding:10px 14px;border-left:3px solid #E1306C;border-radius:4px;">';
  html += '<div style="flex:1;overflow:hidden;">';
  html += '<div style="font-size:12px;color:#E1306C;font-weight:600;margin-bottom:2px;">Replying to '+(name||'User')+'</div>';
  if(mediaUrl && mediaType === 'image') html += '<div style="display:flex;align-items:center;gap:8px;overflow:hidden;"><img src="'+mediaUrl+'" style="width:30px;height:30px;border-radius:4px;object-fit:cover;flex-shrink:0;"><span style="font-size:13px;color:#fff;overflow-wrap:break-word;word-break:break-word;">'+previewContent+'</span></div>';
  else html += '<div style="font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+previewContent+'</div>';
  html += '</div>';
  html += '<div onclick="cancelReply()" style="cursor:pointer;font-size:18px;padding-left:10px;">✕</div>';
  html += '</div>';

  box.innerHTML = html;
  document.getElementById('minp')?.focus();

  // ── Bug 1 Fix: Shift scroll-down-btn up to avoid overlap with reply-preview bar ──
  const scrollBtn = document.getElementById('scroll-down-btn');
  if(scrollBtn && scrollBtn.style.display !== 'none') {
    const replyHeight = box.offsetHeight;
    scrollBtn.style.bottom = (70 + replyHeight) + 'px';
  }
}

function cancelReply(){
  window.replyToId=null;
  window.replyToText='';
  const box=document.getElementById('reply-preview');
  if(box) box.style.display='none';
  // ── Bug 1 Fix: Reset scroll-down-btn back to original position ──
  const scrollBtn = document.getElementById('scroll-down-btn');
  if(scrollBtn) scrollBtn.style.bottom = '70px';
}
