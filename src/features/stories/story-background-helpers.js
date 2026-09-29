// Story editor background tool helpers.
function seOpenBgTool(){
  document.getElementById('se-bg-panel').style.display = 'block';
}

function seCloseBgPanel(){
  document.getElementById('se-bg-panel').style.display = 'none';
}

function seSelectBg(gradient, idx){
  storyEditorBg = gradient;
  document.getElementById('se-bg-overlay').style.background = gradient;
  document.querySelectorAll('.se-bg-opt').forEach(el=>{el.style.borderColor='rgba(255,255,255,0.1)';});
  document.querySelectorAll('.se-bg-opt')[idx].style.borderColor = '#FF2D7A';
  seCloseBgPanel();
}
