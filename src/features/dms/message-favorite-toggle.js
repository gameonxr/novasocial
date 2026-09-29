// Message sticker favorite toggle helper.
function toggleFavFromMsg(encUrl){
  const url = decodeURIComponent(encUrl);

  let favs = JSON.parse(localStorage.getItem('fav_stickers') || '[]');

  if(favs.includes(url)){
    favs = favs.filter(u => u !== url);
    toast('Removed from Favorites');
  }else{
    favs.unshift(url);
    toast('Added to Favorites ⭐');
  }

  localStorage.setItem('fav_stickers', JSON.stringify(favs));
  closeModal();
}
