// undoStoryEditor — extracted from index.html
// Owner SHA-256: ddbc03014d67ca11ca8a79d27ff5a154529b31cb78b5dd746119a90d7e3f0e41
// Classic script — exposes window.undoStoryEditor

window.undoStoryEditor = function undoStoryEditor(){
  // Undo drawing
  seUndoDraw();
  // If no drawing to undo, undo last element
  if(storyEditorUndoStack.length === 0 && storyEditorElements.length > 0){
    storyEditorElements.pop();
    renderStoryElements();
    document.getElementById('se-undo-btn').style.display = storyEditorElements.length > 0 || storyEditorUndoStack.length > 0 ? 'flex' : 'none';
  }
};
