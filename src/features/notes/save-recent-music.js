// Recent note-music localStorage helper.
function saveRecentMusic(title, artist, artwork, previewUrl){
  try{
    let recents = JSON.parse(localStorage.getItem('nova_recent_music')||'[]');
    recents = recents.filter(s=>s.title!==title || s.artist!==artist);
    recents.unshift({title, artist, artwork, previewUrl});
    if(recents.length>8) recents = recents.slice(0,8);
    localStorage.setItem('nova_recent_music', JSON.stringify(recents));
  }catch(e){}
}

// 🎚️ Instagram-style segment picker — choose which 10-sec part of the 30-sec preview
