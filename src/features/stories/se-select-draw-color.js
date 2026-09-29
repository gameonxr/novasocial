// Story editor draw-color selector.
function seSelectDrawColor(c){
  storyEditorDrawColor = c;
  document.querySelectorAll('.se-dcolor-opt').forEach(el=>{el.style.borderColor='rgba(255,255,255,0.1)';});
  event.target.style.borderColor = '#FF2D7A';
}
