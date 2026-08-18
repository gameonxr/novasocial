// Isolated FAB hide action UI helper.
function hideFabButton(){
  const fab = document.getElementById('fab-main');
  if(fab) fab.style.display = 'none';
  try { localStorage.setItem('nova-fab-hidden', 'true'); } catch(e) {}
  closeFabLongPressMenu();
  toast('Upload shortcut hidden. Long press Home icon to restore.');
}
