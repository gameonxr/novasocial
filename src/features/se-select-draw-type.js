// Story editor draw-type selector.
function seSelectDrawType(type){
  storyEditorDrawType = type;
  document.querySelectorAll('.se-draw-type').forEach(el=>{
    if(el.dataset.type === type){
      el.style.background = 'linear-gradient(135deg,#FF2D7A,#833AB4)';
      el.style.color = '#fff';
    } else {
      el.style.background = 'rgba(255,255,255,0.04)';
      el.style.color = '#8A8A8A';
    }
  });
}
