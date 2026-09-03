// _setupCropDragHandlers — extracted from index.html
// Owner SHA-256: c0801301c4563b127e2663cfd6142c1de22d49af0582926ec0cdb18aa9fb2187
// Classic script — exposes window._setupCropDragHandlers

window._setupCropDragHandlers = function _setupCropDragHandlers() {
  const viewport = document.getElementById('crop-viewport');
  const imgEl = document.getElementById('crop-image');
  if(!viewport || !imgEl) return;

  let startX = 0, startY = 0;
  let lastOffsetX = 0, lastOffsetY = 0;
  let isDragging = false;

  // Pinch-zoom state
  let initialPinchDist = 0;
  let initialScale = 1;

  const getDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  };

  const applyTransform = () => {
    imgEl.style.transform = `translate(calc(-50% + ${_cropState.offsetX}px), calc(-50% + ${_cropState.offsetY}px)) scale(${_cropState.scale})`;
  };

  const onStart = (clientX, clientY, touches) => {
    isDragging = true;
    startX = clientX;
    startY = clientY;
    lastOffsetX = _cropState.offsetX;
    lastOffsetY = _cropState.offsetY;

    if(touches && touches.length === 2) {
      initialPinchDist = getDist(touches);
      initialScale = _cropState.scale;
    }
  };

  const onMove = (clientX, clientY, touches) => {
    if(!isDragging) return;

    if(touches && touches.length === 2) {
      const newDist = getDist(touches);
      if(initialPinchDist > 0) {
        const scaleFactor = newDist / initialPinchDist;
        let newScale = initialScale * scaleFactor;
        newScale = Math.max(_cropState.minScale, Math.min(_cropState.minScale * 3, newScale));
        _cropState.scale = newScale;
        const slider = document.getElementById('crop-zoom-slider');
        if(slider) slider.value = Math.round((newScale / _cropState.minScale) * 100);
        applyTransform();
      }
      return;
    }

    const dx = clientX - startX;
    const dy = clientY - startY;

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const iw = imgEl.naturalWidth * _cropState.scale;
    const ih = imgEl.naturalHeight * _cropState.scale;

    const maxOffsetX = Math.max(0, (iw - vw) / 2);
    const maxOffsetY = Math.max(0, (ih - vh) / 2);

    _cropState.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, lastOffsetX + dx));
    _cropState.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, lastOffsetY + dy));

    applyTransform();
  };

  const onEnd = () => { isDragging = false; };

  // Touch events
  viewport.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if(t) onStart(t.clientX, t.clientY, e.touches);
  }, { passive: false });

  viewport.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if(t) onMove(t.clientX, t.clientY, e.touches);
  }, { passive: false });

  viewport.addEventListener('touchend', onEnd);

  // Mouse events (desktop)
  viewport.addEventListener('mousedown', (e) => {
    onStart(e.clientX, e.clientY);
    viewport.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if(isDragging) onMove(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', () => {
    onEnd();
    viewport.style.cursor = 'grab';
  });
};
