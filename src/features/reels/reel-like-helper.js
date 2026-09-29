// Isolated Reels double-like animation helper extracted from index.html.
function dblLikeReel(pid, cont) {
  const el=document.getElementById('lbtn-'+pid);
  if(el&&el.dataset.liked!=='true') toggleLike(pid);

  // Flying Hearts Animation
  for(let i=0; i<6; i++) {
    setTimeout(() => {
      const p=document.createElement('div');
      p.textContent='❤️';
      p.style.cssText = 'position:absolute; top:'+(30 + Math.random() * 40)+'%; left:'+(30 + Math.random() * 40)+'%; font-size:'+(40 + Math.random() * 30)+'px; pointer-events:none; z-index:10; animation:heartPop 0.8s ease forwards;';
      cont.appendChild(p);
      setTimeout(()=>p.remove(), 800);
    }, i * 100);
  }
}
