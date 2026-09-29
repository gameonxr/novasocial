// Story editor draw-panel closer.
function seCloseDrawPanel(){
  document.getElementById('se-draw-panel').style.display = 'none';
  storyEditorDrawMode = false;
  storyEditorCanvas.style.pointerEvents = 'none';
}
