// initFabSystem — extracted from index.html
// Owner SHA-256: c91f172a276e1f74e8a06949f9f540f4ae01e1ca77c2dc6f4fb7d5b775d2f3c3
// Classic script — exposes window.initFabSystem

window.initFabSystem = function initFabSystem(){
  // Restore size
  try {
    const savedSize = localStorage.getItem('nova-fab-size');
    if(savedSize){ fabSize = parseInt(savedSize); const fab = document.getElementById('fab-main'); if(fab){ fab.style.width = fabSize + 'px'; fab.style.height = fabSize + 'px'; } }
  } catch(e) {}
  // Restore style
  try {
    const savedStyle = localStorage.getItem('nova-fab-style');
    if(savedStyle){ fabStyle = parseInt(savedStyle); changeFabStyle(); fabStyle = parseInt(savedStyle); } // apply without incrementing
  } catch(e) {}
  setupFabDrag();
};
