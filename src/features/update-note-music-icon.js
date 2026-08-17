// Note-viewer music icon renderer.
function updateNoteMusicIcon(playing){
  const icon = document.getElementById('note-music-play-icon');
  if(!icon) return;
  icon.innerHTML = playing
    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
    : '<polygon points="5 3 19 12 5 21 5 3"/>';
}
