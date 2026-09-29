// Story editor music tool helpers.
function seOpenMusicTool(){
  document.getElementById('se-music-panel').style.display = 'block';
}

function seCloseMusicPanel(){
  document.getElementById('se-music-panel').style.display = 'none';
}

function seSelectMusic(idx){
  const songs = [
    {title:'Lofi Beats', artist:'Nova Radio'},
    {title:'Cyber Dreams', artist:'Synthwave'},
    {title:'Midnight City', artist:'Neon Lights'},
    {title:'Electric Pulse', artist:'DJ Nova'},
    {title:'Starlight', artist:'Aurora'},
    {title:'Digital Love', artist:'Cyber Pop'},
    {title:'Future Bass', artist:'EDM Mix'},
    {title:'Chill Vibes', artist:'Lo-Fi Girl'},
  ];
  storyEditorMusic = songs[idx];
  document.getElementById('se-music-bar').style.display = 'flex';
  document.getElementById('se-music-info').textContent = storyEditorMusic.title + ' — ' + storyEditorMusic.artist;
  seCloseMusicPanel();
  toast('Music added: ' + storyEditorMusic.title);
}

function removeStoryMusic(){
  storyEditorMusic = null;
  document.getElementById('se-music-bar').style.display = 'none';
}
