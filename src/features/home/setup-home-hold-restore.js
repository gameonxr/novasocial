// Isolated Home-tab long-press restore listener helper.
function setupHomeHoldRestore(){
  let homeTimer = null;
  document.addEventListener('touchstart', (e) => {
    const homeNav = e.target.closest('.nb[data-t="home"]');
    if(homeNav){
      homeTimer = setTimeout(() => {
        restoreFabButton();
        haptic(20);
      }, 2000);
    }
  }, {passive: true});
  document.addEventListener('touchend', () => { if(homeTimer){ clearTimeout(homeTimer); homeTimer = null; } });
  document.addEventListener('touchmove', () => { if(homeTimer){ clearTimeout(homeTimer); homeTimer = null; } });
  document.addEventListener('mousedown', (e) => {
    const homeNav = e.target.closest('.nb[data-t="home"]');
    if(homeNav){
      homeTimer = setTimeout(() => restoreFabButton(), 2000);
    }
  });
  document.addEventListener('mouseup', () => { if(homeTimer){ clearTimeout(homeTimer); homeTimer = null; } });
}
