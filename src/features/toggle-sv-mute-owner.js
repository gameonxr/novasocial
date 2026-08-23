// Story-viewer mute toggle owner; story rendering and playback lifecycle remain inline.
window.toggleSVMute = function(){
  window._svMuted = !window._svMuted;
  const vid = document.querySelector('#sv-media video');
  if(vid) vid.muted = window._svMuted;
  renderSV(); // Re-render to update icon
};
