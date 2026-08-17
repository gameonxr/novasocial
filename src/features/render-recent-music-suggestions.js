// Recent note-music suggestions renderer.
function renderRecentMusicSuggestions(){
  const r = document.getElementById('music-search-results');
  if(!r) return;
  let recents = [];
  try{ recents = JSON.parse(localStorage.getItem('nova_recent_music')||'[]'); }catch(e){}
  if(!recents.length){
    r.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#444;font-size:13px">Gaana search karo shuru karne ke liye 🎵</div>';
    return;
  }
  r.innerHTML = '<div style="color:#666;font-size:11px;font-weight:700;margin:12px 0 8px;letter-spacing:0.5px">RECENTLY USED</div>' +
    recents.map(song=>`
      <div onclick='selectNoteMusicResult(${JSON.stringify(song.title)},${JSON.stringify(song.artist)},${JSON.stringify(song.artwork||"")},${JSON.stringify(song.previewUrl||"")})' style="display:flex;align-items:center;gap:12px;padding:10px 4px;cursor:pointer;border-bottom:1px solid #111">
        ${song.artwork?`<img src="${song.artwork}" style="width:44px;height:44px;border-radius:8px;object-fit:cover">`:`<div style="width:44px;height:44px;border-radius:8px;background:#1a1a1a;display:flex;align-items:center;justify-content:center">🎵</div>`}
        <div style="flex:1;overflow:hidden">
          <div style="font-weight:700;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</div>
          <div style="font-size:11px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.artist}</div>
        </div>
      </div>`).join('');
}
