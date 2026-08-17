// Note-music search controller.
async function searchMusicForNote(q){
  clearTimeout(_musicSearchDebounce);
  const r = document.getElementById('music-search-results');
  if(!r) return;
  if(!q.trim()){ renderRecentMusicSuggestions(); return; }
  r.innerHTML = '<div style="text-align:center;padding:20px;color:#555">Searching...</div>';
  _musicSearchDebounce = setTimeout(async()=>{
    try{
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=15`);
      const data = await res.json();
      if(!data.results?.length){ r.innerHTML='<div style="text-align:center;padding:20px;color:#444">No songs found</div>'; return; }
      r.innerHTML = data.results.map((song,idx)=>`
        <div style="display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid #111">
          <div onclick='togglePreviewPlay(${idx}, ${JSON.stringify(song.previewUrl)})' id="preview-btn-${idx}" style="width:44px;height:44px;border-radius:8px;position:relative;cursor:pointer;flex-shrink:0;overflow:hidden">
            <img src="${song.artworkUrl60}" style="width:100%;height:100%;object-fit:cover">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
              <svg id="preview-icon-${idx}" width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
          <div onclick='selectNoteMusicResult(${JSON.stringify(song.trackName)},${JSON.stringify(song.artistName)},${JSON.stringify(song.artworkUrl60||"")},${JSON.stringify(song.previewUrl||"")})' style="flex:1;overflow:hidden;cursor:pointer">
            <div style="font-weight:700;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.trackName}</div>
            <div style="font-size:11px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.artistName}</div>
          </div>
          <div onclick='selectNoteMusicResult(${JSON.stringify(song.trackName)},${JSON.stringify(song.artistName)},${JSON.stringify(song.artworkUrl60||"")},${JSON.stringify(song.previewUrl||"")})' style="color:#E1306C;font-size:12px;font-weight:700;cursor:pointer;padding:6px 10px;flex-shrink:0">Select</div>
        </div>`).join('');
    }catch(e){ r.innerHTML='<div style="text-align:center;padding:20px;color:#555">Search failed, try again</div>'; }
  }, 400);
}
