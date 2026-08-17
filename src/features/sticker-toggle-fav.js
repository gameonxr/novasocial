// Sticker picker favorites toggle.
function stickerToggleFav(idx) {
  const url = (window._stickerUrls || [])[idx];
  if(!url) return;
  let favs = JSON.parse(localStorage.getItem('fav_stickers') || '[]');
  const wasFav = favs.includes(url);
  if(wasFav) {
    favs = favs.filter(u => u !== url);
    toast('Removed from Favorites');
  } else {
    favs.unshift(url);
    toast('Added to Favorites ⭐');
  }
  localStorage.setItem('fav_stickers', JSON.stringify(favs));
  if(activeStickerTab === 'fav') {
    showStickerTab('fav');
  } else {
    const btn = document.getElementById('fav-btn-'+idx);
    if(btn) btn.textContent = wasFav ? '☆' : '⭐';
  }
}
