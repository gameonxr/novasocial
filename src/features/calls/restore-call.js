// restoreCall — extracted from index.html
// Owner SHA-256: 7e8fdda580867e6a415db17eb2ff3e65d09a37fe48d4a89655e8e57513294e3c
// Classic script — exposes window.restoreCall

window.restoreCall = function restoreCall(){
  _callState.isMinimized = false;
  const bubble = document.getElementById('nova-call-bubble');
  if(bubble) bubble.remove();
  const screen = document.getElementById('nova-call-screen');
  if(screen) screen.style.display = 'flex';
};
