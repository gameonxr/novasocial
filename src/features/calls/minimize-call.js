// minimizeCall — extracted from index.html
// Owner SHA-256: dd909841298348d18e647a04860ffc6819b34bb6638012fbdd531642025f3eb4
// Classic script — exposes window.minimizeCall

window.minimizeCall = function minimizeCall(){
  if(!_callState.active) return;
  _callState.isMinimized = true;
  const screen = document.getElementById('nova-call-screen');
  if(screen) screen.style.display = 'none';
  showCallBubble();
};
