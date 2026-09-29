// FAB drag, long-press, persistence, and restore wiring.
function setupFabDrag(){
  const fab = document.getElementById('fab-main');
  if(!fab || fab._fabSetup) return;
  fab._fabSetup = true;

  let isDragging = false;
  let startX = 0, startY = 0;
  let fabStartLeft = 0, fabStartTop = 0;
  let hasMoved = false;
  let longPressTimer = null;

  const onStart = (clientX, clientY) => {
    isDragging = true;
    hasMoved = false;
    startX = clientX;
    startY = clientY;
    const rect = fab.getBoundingClientRect();
    fabStartLeft = rect.left;
    fabStartTop = rect.top;

    // Long press for settings menu
    longPressTimer = setTimeout(() => {
      if(!hasMoved){
        showFabLongPressMenu();
        isDragging = false;
      }
    }, 600);
  };

  const onMove = (clientX, clientY) => {
    if(!isDragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if(Math.abs(dx) > 5 || Math.abs(dy) > 5){
      hasMoved = true;
      if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; }
      closeFabMenu();
      closeFabLongPressMenu();
    }
    if(!hasMoved) return;

    let newX = fabStartLeft + dx;
    let newY = fabStartTop + dy;
    newX = Math.max(8, Math.min(window.innerWidth - fabSize - 8, newX));
    newY = Math.max(8, Math.min(window.innerHeight - fabSize - 80, newY));
    fab.style.left = newX + 'px';
    fab.style.top = newY + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
  };

  const onEnd = () => {
    if(!isDragging) return;
    isDragging = false;
    if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; }

    if(hasMoved){
      // Edge snap
      const rect = fab.getBoundingClientRect();
      if(rect.left < window.innerWidth / 2){
        fab.style.left = '8px';
      } else {
        fab.style.left = (window.innerWidth - fabSize - 8) + 'px';
      }
      try {
        localStorage.setItem('nova-fab-pos', JSON.stringify({left: fab.style.left, top: fab.style.top}));
      } catch(e) {}
      // Prevent click event after drag
      fab.onclick = null;
      setTimeout(() => { fab.onclick = toggleFabMenu; }, 100);
    }
  };

  // Touch
  fab.addEventListener('touchstart', (e) => {
    if(e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
  }, {passive: true});
  fab.addEventListener('touchmove', (e) => {
    if(isDragging && e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, {passive: true});
  fab.addEventListener('touchend', () => onEnd());

  // Mouse
  fab.addEventListener('mousedown', (e) => {
    onStart(e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', (e) => { if(isDragging) onMove(e.clientX, e.clientY); });
  document.addEventListener('mouseup', () => { if(isDragging) onEnd(); });

  // Restore position
  try {
    const savedPos = JSON.parse(localStorage.getItem('nova-fab-pos') || 'null');
    if(savedPos && savedPos.left && savedPos.top){
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.left = savedPos.left;
      fab.style.top = savedPos.top;
    }
  } catch(e) {}

  // Check if hidden
  if(localStorage.getItem('nova-fab-hidden') === 'true'){
    fab.style.display = 'none';
  }

  setupHomeHoldRestore();
}
