// Preview icon reset helper; audio playback state remains inline.
function resetPreviewIcon(idx){
  const icon = document.getElementById('preview-icon-'+idx);
  if(icon) icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
}
