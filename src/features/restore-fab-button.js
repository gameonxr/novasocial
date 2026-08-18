// Isolated FAB restore action UI helper.
function restoreFabButton(){
  const fab = document.getElementById('fab-main');
  if(fab){
    fab.style.display = 'flex';
    fab.style.animation = 'novaScaleIn 0.4s ease';
    try { localStorage.setItem('nova-fab-hidden', 'false'); } catch(e) {}
    // Only show if on Home tab
    if(curTab === 'home'){
      fab.style.display = 'flex';
    }
    toast('Upload Button Restored');
  }
}
