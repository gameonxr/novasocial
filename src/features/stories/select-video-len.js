// Isolated video-length selection UI helper.
function selectVideoLen(s){
  window._videoTrimTo=s;
  document.querySelectorAll('.vlen-pill').forEach(p=>{
    const match=(s==='full'&&p.dataset.s==='full')||(p.dataset.s==String(s));
    p.style.background=match?'#fff':'#1a1a1a';p.style.color=match?'#000':'#aaa';
  });
}
