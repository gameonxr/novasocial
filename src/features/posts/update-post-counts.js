// Isolated post-count DOM updater.
function updatePostCounts(pid,likesCount,commentsCount){
  const el=document.getElementById('lbtn-'+pid);
  if(el) el.dataset.cnt=likesCount;
  const lc1=document.getElementById('lcnt-'+pid);
  if(lc1){lc1.textContent=fmt(likesCount)+' likes';lc1.style.display=likesCount>0?'block':'none';}
  const lc2=document.getElementById('lcnt-'+pid+'-txt');
  if(lc2) lc2.textContent=fmt(likesCount);
  const cc=document.getElementById('ccnt-'+pid);
  if(cc){cc.textContent='View all '+commentsCount+' comments';cc.style.display=commentsCount>0?'block':'none';}
  const cc2=document.getElementById('ccnt-'+pid+'-txt');
  if(cc2) cc2.textContent=fmt(commentsCount);
}
