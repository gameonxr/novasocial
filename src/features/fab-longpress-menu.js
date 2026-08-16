// FAB long-press menu positioning and close helpers.
function showFabLongPressMenu(){
  const menu = document.getElementById('fab-longpress-menu');
  const fab = document.getElementById('fab-main');
  if(!menu || !fab) return;
  const rect = fab.getBoundingClientRect();
  menu.style.display = 'flex';
  menu.style.animation = 'novaScaleIn 0.2s ease';
  // Position above FAB
  let menuLeft = rect.left;
  let menuTop = rect.top - 200;
  if(menuTop < 10) menuTop = rect.bottom + 10;
  if(menuLeft + 180 > window.innerWidth) menuLeft = window.innerWidth - 190;
  menu.style.left = menuLeft + 'px';
  menu.style.top = menuTop + 'px';
}

function closeFabLongPressMenu(){
  const menu = document.getElementById('fab-longpress-menu');
  if(menu) menu.style.display = 'none';
}
