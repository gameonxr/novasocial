// Story editor sticker tool helpers.
function seOpenStickerTool(){
  document.getElementById('se-sticker-panel').style.display = 'block';
}

function seCloseStickerPanel(){
  document.getElementById('se-sticker-panel').style.display = 'none';
}

function seAddSticker(emoji){
  storyEditorElements.push({
    id: 'el_' + Date.now(),
    type: 'sticker',
    text: emoji,
    x: 50,
    y: 50,
    scale: 1,
    rotate: 0,
    fontSize: 40,
  });
  renderStoryElements();
  seCloseStickerPanel();
}

function seAddCustomSticker(){
  const text = document.getElementById('se-custom-sticker').value.trim();
  if(!text) return;
  storyEditorElements.push({
    id: 'el_' + Date.now(),
    type: 'sticker',
    text: text,
    x: 50,
    y: 50,
    scale: 1,
    rotate: 0,
    fontSize: 24,
    isText: true,
    fontFamily: '-apple-system, sans-serif',
    fontWeight: 700,
    color: '#FFFFFF',
    bg: 'rgba(0,0,0,0.3)',
    padding: '6px 12px',
    borderRadius: '8px',
  });
  renderStoryElements();
  document.getElementById('se-custom-sticker').value = '';
  seCloseStickerPanel();
}
