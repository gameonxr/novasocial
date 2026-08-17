// Story editor drawing canvas event wiring and undo capture.
function setupStoryDrawing(){
  let drawing = false;
  let lastX = 0, lastY = 0;

  const getPos = (e) => {
    const rect = storyEditorCanvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return {x: t.clientX - rect.left, y: t.clientY - rect.top};
  };

  const start = (e) => {
    if(!storyEditorDrawMode) return;
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    storyEditorDrawCtx.beginPath();
    storyEditorDrawCtx.moveTo(lastX, lastY);
  };

  const move = (e) => {
    if(!drawing || !storyEditorDrawMode) return;
    e.preventDefault();
    const pos = getPos(e);

    storyEditorDrawCtx.strokeStyle = storyEditorDrawColor;
    storyEditorDrawCtx.lineWidth = storyEditorDrawSize;
    storyEditorDrawCtx.lineCap = 'round';
    storyEditorDrawCtx.lineJoin = 'round';

    if(storyEditorDrawType === 'marker'){
      storyEditorDrawCtx.globalAlpha = 0.5;
      storyEditorDrawCtx.shadowBlur = 0;
    } else if(storyEditorDrawType === 'neon'){
      storyEditorDrawCtx.globalAlpha = 1;
      storyEditorDrawCtx.shadowBlur = 15;
      storyEditorDrawCtx.shadowColor = storyEditorDrawColor;
    } else {
      storyEditorDrawCtx.globalAlpha = 1;
      storyEditorDrawCtx.shadowBlur = 0;
    }

    storyEditorDrawCtx.lineTo(pos.x, pos.y);
    storyEditorDrawCtx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  };

  const end = () => {
    if(!drawing) return;
    drawing = false;
    // Save state for undo
    try {
      const imgData = storyEditorDrawCtx.getImageData(0,0,storyEditorCanvas.width,storyEditorCanvas.height);
      storyEditorUndoStack.push(imgData);
    } catch(e) {}
    document.getElementById('se-undo-btn').style.display = 'flex';
  };

  storyEditorCanvas.addEventListener('touchstart', start, {passive:false});
  storyEditorCanvas.addEventListener('touchmove', move, {passive:false});
  storyEditorCanvas.addEventListener('touchend', end);
  storyEditorCanvas.addEventListener('mousedown', start);
  storyEditorCanvas.addEventListener('mousemove', move);
  storyEditorCanvas.addEventListener('mouseup', end);
}
