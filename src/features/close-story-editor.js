// closeStoryEditor — extracted from index.html
// Owner SHA-256: e89447e4da4d1640bb51deceaab8aeacc145b79c1c4d0773dc7c16169c01353f
// Classic script — exposes window.closeStoryEditor

window.closeStoryEditor = function closeStoryEditor(){
  const editor = document.getElementById('story-editor');
  if(editor) editor.remove();
  storyEditorElements = [];
  storyEditorMedia = null;
};
