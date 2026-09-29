// Note-music search panel renderer.
function openMusicSearch(){
  const panel = document.createElement('div');
  panel.className = 'se-panel';
  panel.id = 'music-search-panel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0a;display:flex;flex-direction:column;';
  panel.innerHTML = `
    <div style="flex-shrink:0;position:sticky;top:0;background:linear-gradient(180deg,#0a0a0a,rgba(10,10,10,0.95));z-index:2;padding:16px 16px 8px;backdrop-filter:blur(10px)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div onclick="stopAllPreviewAudio();document.getElementById('music-search-panel').remove()" style="cursor:pointer;color:#aaa;padding:4px">${ico('close','#aaa',20)}</div>
        <div style="font-weight:800;font-size:16px;color:#fff">Add Music</div>
        <div style="width:28px"></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;background:#161616;border-radius:14px;padding:12px 16px;border:1px solid #222">
        ${ico('search','#666',18)}
        <input id="music-search-inp" placeholder="Search songs, artists..." oninput="searchMusicForNote(this.value)" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1">
      </div>
    </div>
    <div id="music-search-results" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 16px 24px;"></div>`;
  document.body.appendChild(panel);

  const inp = document.getElementById('music-search-inp');
  setTimeout(()=>{
    inp?.focus();
    inp?.addEventListener('focus', ()=>{
      setTimeout(()=>{ inp.scrollIntoView({block:'center', behavior:'smooth'}); }, 300);
    });
  }, 100);

  renderRecentMusicSuggestions();
}
