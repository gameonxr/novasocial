// Story editor font-option selector.
function seSelectFont(idx){
  seCurrentFont = idx;
  document.querySelectorAll('.se-font-opt').forEach((el,i)=>{
    if(i === idx){
      el.style.background = 'linear-gradient(135deg,#FF2D7A,#833AB4)';
      el.style.color = '#fff';
    } else {
      el.style.background = 'rgba(255,255,255,0.04)';
      el.style.color = '#8A8A8A';
    }
  });
}
