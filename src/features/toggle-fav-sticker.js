// Sticker favorites toggle with local persistence.
function toggleFavSticker(url, e, btn) {
  if(e) e.stopPropagation(); // Sticker send na ho
  let favs = getLocalStickers('fav');
  if (favs.includes(url)) {
    favs = favs.filter(u => u !== url);
    if(btn) btn.textContent = '☆';
    toast('Removed from Favorites');
  } else {
    favs.unshift(url);
    if(btn) btn.textContent = '⭐';
    toast('Added to Favorites ⭐');
  }
  localStorage.setItem('fav_stickers', JSON.stringify(favs));
}
