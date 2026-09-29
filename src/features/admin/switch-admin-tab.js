// Extracted from index.html during Phase 82.
function switchAdminTab(tab){
  document.querySelectorAll('.admin-tab').forEach(t => {
    if(t.dataset.tab === tab){ t.style.background='rgba(255,45,122,0.15)'; t.style.border='1px solid #FF2D7A'; t.style.color='#FF2D7A'; }
    else { t.style.background='rgba(255,255,255,0.04)'; t.style.border='1px solid rgba(255,255,255,0.06)'; t.style.color='#8A8A8A'; }
  });
  loadAdminTab(tab);
}
