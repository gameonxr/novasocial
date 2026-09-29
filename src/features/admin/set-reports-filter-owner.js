window.setReportsFilter = function(f){
  _reportsFilter=f;
  ['pending','resolved','dismissed','all'].forEach(x=>{ const el=document.getElementById('rf-'+x); if(!el)return; if(x===f){ const c={pending:'#ffaa00',resolved:'#3db83d',dismissed:'#8A8A8A',all:'#a855f7'}[x]; el.style.background=c+'26'; el.style.border='1px solid '+c; el.style.color=c; } else { el.style.background='rgba(255,255,255,0.04)'; el.style.border='1px solid rgba(255,255,255,0.06)'; el.style.color='#8A8A8A'; } });
  loadReportsList();
};
