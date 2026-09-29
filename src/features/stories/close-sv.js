// closeSV — extracted from index.html
// Owner SHA-256: 94d3b652cf04591d7924813bad57bdbbe0778ba2d36f9f0b970f68346205a38a
// Classic script — exposes window.closeSV

window.closeSV = function closeSV(){
  // NAV-STACK: pop if not already being popped by hardware back
  if(!window._navPopInProgress && window.navStack.length > 0 && window.navStack[window.navStack.length-1].type === 'story'){
    window.navStack.pop();
  }
  stopSVPlayback();
  pauseAllVideos();
  // Clean up any lingering overlay (polls/mentions)
  document.querySelector('.sv-overlay-root')?.remove();
  document.getElementById('sv').classList.remove('show', 'sv-paused');
};
