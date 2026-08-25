window.jumpToMessage = function(mid){
  const el=document.querySelector(`[data-msgid="${mid}"]`);
  if(!el){ toast("Message not loaded"); return; }
  el.scrollIntoView({behavior:'smooth',block:'center'});
  el.style.transition='0.3s';
  el.style.background='rgba(225,48,108,0.25)';
  setTimeout(()=>{ el.style.background=''; },2000);
  document.querySelector('.modal')?.remove();
};
