// New-posts indicator pill for non-destructive feed refreshes.
function showNewPostsIndicator(){
  if(document.getElementById('new-posts-pill')) return; // already dikh raha hai
  const scr = document.getElementById('screen');
  if(!scr) return;
  const pill = document.createElement('div');
  pill.id = 'new-posts-pill';
  pill.onclick = ()=>{ pill.remove(); invalidateTabCache('home'); go('home'); }; // tap = fresh load
  pill.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#E1306C;color:#fff;font-size:13px;font-weight:700;padding:9px 18px;border-radius:20px;box-shadow:0 6px 20px rgba(225,48,108,0.4);z-index:500;cursor:pointer;display:flex;align-items:center;gap:6px;animation:slideDownFade 0.3s ease';
  pill.innerHTML = '↑ New posts';
  document.body.appendChild(pill);
  setTimeout(()=>{ if(pill && pill.parentNode) pill.remove(); }, 8000); // 8 sec baad khud gayab
}
