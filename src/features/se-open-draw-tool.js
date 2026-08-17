// Story editor draw-tool opener.
function seOpenDrawTool(){
  document.getElementById('se-draw-panel').style.display = 'block';
  storyEditorDrawMode = true;
  storyEditorCanvas.style.pointerEvents = 'auto';
}
