// Sticker-picker tab renderer; send/favorite actions and GIF search remain inline.
function showStickerTab(tab) {
  activeStickerTab = tab;
  ['recent','fav','search'].forEach(t => {
    const el = document.getElementById('tab-'+t);
    if(el) { el.style.color='#666'; el.style.fontWeight='600'; el.style.borderBottom='none'; }
  });
  const activeEl = document.getElementById('tab-'+tab);
  if(activeEl) { activeEl.style.color='#fff'; activeEl.style.fontWeight='700'; activeEl.style.borderBottom='2px solid #fff'; }
  const content = document.getElementById('sticker-content');
  if(!content) return;
  const favUrls = JSON.parse(localStorage.getItem('fav_stickers') || '[]');
  const recentUrls = JSON.parse(localStorage.getItem('recent_stickers') || '[]');
  window._stickerUrls = [];
  if(tab === 'recent') {
    if(!recentUrls.length) { content.innerHTML = '<div style="color:#444;text-align:center;padding:30px">Abhi koi recent sticker nahi hai.</div>'; return; }
    window._stickerUrls = [...recentUrls];
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">';
    recentUrls.forEach((url, i) => {
      const isFav = favUrls.includes(url);
      html += '<div style="position:relative;"><img src="'+url+'" onclick="stickerSend('+i+')" style="width:100%;height:100px;object-fit:cover;border-radius:8px;cursor:pointer;"><div id="fav-btn-'+i+'" onclick="stickerToggleFav('+i+')" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.7);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;">'+(isFav?'⭐':'☆')+'</div></div>';
    });
    content.innerHTML = html + '</div>';
  } else if(tab === 'fav') {
    if(!favUrls.length) { content.innerHTML = '<div style="color:#444;text-align:center;padding:30px">Koi favorite nahi. Sticker par ☆ dabakar add karein.</div>'; return; }
    window._stickerUrls = [...favUrls];
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">';
    favUrls.forEach((url, i) => {
      html += '<div style="position:relative;"><img src="'+url+'" onclick="stickerSend('+i+')" style="width:100%;height:100px;object-fit:cover;border-radius:8px;cursor:pointer;"><div id="fav-btn-'+i+'" onclick="stickerToggleFav('+i+')" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.7);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;">❌</div></div>';
    });
    content.innerHTML = html + '</div>';
  } else if(tab === 'search') {
    content.innerHTML = '<div class="sbar2" style="margin-bottom:12px;">'+ico('search','#666',18)+'<input placeholder="Search GIFs..." id="giphy-inp" oninput="searchGiphy(this.value)" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div><div id="giphy-results" style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;"></div>';
    searchGiphy('trending');
  }
}
