// goBack — extracted from index.html
// Owner SHA-256: 14e5bc693023cb98457e4bd9df578c9d2468f9c5013b3fdfb22207acaa34dd35
// Classic script — exposes window.goBack

window.goBack = function goBack(){
  haptic(10);
  // Try nav stack first (hardware back style)
  if(popNavState()){
    if(!window._navPopInProgress && 'pushState' in history){
      history.pushState({ navDepth: window.navStack.length }, '', location.href);
    }
    return;
  }
  // Stack empty — fallback: close overlays manually
  const cmodal = document.getElementById('cmodal');
  if(cmodal){ closeModal(); return; }
  const sv = document.getElementById('sv');
  if(sv && sv.classList.contains('show')){ closeSV(); return; }
  const actionSheet = document.getElementById('action-sheet-bg');
  if(actionSheet){ actionSheet.remove(); return; }
  const banScreen = document.getElementById('ban-screen');
  if(banScreen){ banScreen.remove(); return; }
  if(curTab !== 'home'){ go('home'); }
};
