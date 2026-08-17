// Story editor drawing undo controller.
function seUndoDraw(){
  if(storyEditorUndoStack.length > 0){
    storyEditorUndoStack.pop();
    storyEditorDrawCtx.clearRect(0,0,storyEditorCanvas.width,storyEditorCanvas.height);
    storyEditorUndoStack.forEach(imgData => storyEditorDrawCtx.putImageData(imgData, 0, 0));
  }
}
