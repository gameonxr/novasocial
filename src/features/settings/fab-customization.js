// FAB size and style customization helpers.
function changeFabSize(){
  const sizes = [44, 52, 60, 68];
  const currentIdx = sizes.indexOf(fabSize);
  fabSize = sizes[(currentIdx + 1) % sizes.length];
  const fab = document.getElementById('fab-main');
  if(fab){
    fab.style.width = fabSize + 'px';
    fab.style.height = fabSize + 'px';
    try { localStorage.setItem('nova-fab-size', fabSize.toString()); } catch(e) {}
  }
  toast('Size: ' + fabSize + 'px');
  closeFabLongPressMenu();
}

function changeFabStyle(){
  const styles = [
    {bg: 'linear-gradient(135deg,#FF2D7A,#833AB4)', border: 'none'},
    {bg: 'rgba(10,10,10,0.8)', border: '1.5px solid rgba(255,45,122,0.3)'},
    {bg: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)'},
  ];
  fabStyle = (fabStyle + 1) % styles.length;
  const fab = document.getElementById('fab-main');
  if(fab){
    fab.style.background = styles[fabStyle].bg;
    fab.style.border = styles[fabStyle].border;
    if(fabStyle === 1) fab.style.backdropFilter = 'blur(16px)';
    else fab.style.backdropFilter = 'none';
    try { localStorage.setItem('nova-fab-style', fabStyle.toString()); } catch(e) {}
  }
  toast('Style Changed');
  closeFabLongPressMenu();
}
