// setChatTheme — extracted from index.html
// Owner SHA-256: f67bf3d046c908ef33d66c8a58ab6a856819e2a25e33cf9b23b5a2d7b94da73a
// Classic script — exposes window.setChatTheme

window.setChatTheme = async function setChatTheme(cid, theme, elem) {
  await db.from('conversations').update({ theme: theme }).eq('id', cid);
  toast('Theme updated! 🎨');
  // Instant UI Update
  document.querySelectorAll('#theme-opts > div').forEach(d => d.style.borderColor = 'transparent');
  if(elem) elem.style.borderColor = '#E1306C';

  // Chat background instantly change
  const mlist = document.getElementById('mlist');
  if(mlist) {
    if(theme === 'cyberpunk') mlist.style.background = "linear-gradient(45deg,#0a0a0a,#1a0533)";
    else if(theme === 'tropical') mlist.style.background = "linear-gradient(45deg,#0a0a0a,#05331a)";
    else if(theme === 'pride') mlist.style.background = "linear-gradient(45deg,#0a0a0a,#330a0a)";
    else mlist.style.background = "#000";
  }
};
