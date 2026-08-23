// Classic-script admin verification filter owner.
window.setVerifyFilter = function(f){
  _verifyFilter=f;
  ['pending','approved','rejected','all'].forEach(x=>{ const el=document.getElementById('vf-'+x); if(!el)return; if(x===f){ const c={pending:'#3897f0',approved:'#3db83d',rejected:'#ff4444',all:'#a855f7'}[x]; el.style.background=c+'26'; el.style.border='1px solid '+c; el.style.color=c; } else { el.style.background='rgba(255,255,255,0.04)'; el.style.border='1px solid rgba(255,255,255,0.06)'; el.style.color='#8A8A8A'; } });
  loadVerifyList();
};
