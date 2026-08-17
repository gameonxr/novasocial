// Note music-section renderer; search, selection, and preview remain inline.
function renderNoteMusicSection(){
  const sec = document.getElementById('note-music-section');
  if(!sec) return;
  if(window._noteMusic){
    sec.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;background:#141414;padding:10px 14px;border-radius:16px;border:1px solid #1f1f1f">
        ${window._noteMusic.artwork ? `<img src="${window._noteMusic.artwork}" style="width:38px;height:38px;border-radius:8px;object-fit:cover">` : `<div style="width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#1DB954,#0d8a3e);display:flex;align-items:center;justify-content:center;font-size:16px">🎵</div>`}
        <div style="flex:1;overflow:hidden">
          <div style="font-weight:700;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${window._noteMusic.title}</div>
          <div style="font-size:11px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${window._noteMusic.artist||''}</div>
        </div>
        <div onclick="window._noteMusic=null;renderNoteMusicSection()" style="cursor:pointer;color:#555;padding:4px">${ico('close','#555',16)}</div>
      </div>`;
  } else {
    sec.innerHTML = `
      <div onclick="openMusicSearch()" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px dashed #2a2a2a;border-radius:16px;cursor:pointer;color:#888">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <span style="font-size:13px">Add a song</span>
      </div>`;
  }
}
