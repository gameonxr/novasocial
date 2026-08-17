// Story editor text-color selector.
function seSelectTextColor(c){
  seCurrentTextColor = c;
  seGradientText = false;
  document.querySelectorAll('.se-color-opt').forEach(el=>{el.style.borderColor='rgba(255,255,255,0.1)';});
  event.target.style.borderColor = '#FF2D7A';
}
