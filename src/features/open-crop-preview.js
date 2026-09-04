// openCropPreview — extracted from index.html
// Owner SHA-256: 36a8936ca735195cec339ba75c557b08f4256c41193ecd97688669b823523f72
// Classic script — exposes window.openCropPreview

window.openCropPreview = function openCropPreview(file, cropType, onConfirmCallback) {
  if(!file || !file.type.startsWith('image/')) {
    // Video ya invalid file — crop skip karo, seedha upload
    if(onConfirmCallback) onConfirmCallback(file);
    return;
  }

  _cropState.file = file;
  _cropState.cropType = cropType;
  _cropState.onConfirm = onConfirmCallback;
  _cropState.scale = 1;
  _cropState.offsetX = 0;
  _cropState.offsetY = 0;

  const isAvatar = cropType === 'avatar';
  const aspectRatio = isAvatar ? '1/1' : '16/6'; // avatar square, cover wide
  const shapeStyle = isAvatar ? 'border-radius:50%' : 'border-radius:12px';

  document.getElementById('nova-crop-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'nova-crop-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;';

  const url = URL.createObjectURL(file);

  modal.innerHTML = `
    <!-- Top bar -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#0A0A0A;border-bottom:1px solid rgba(255,255,255,0.08)">
      <div onclick="closeCropPreview()" style="color:#fff;font-size:15px;font-weight:600;cursor:pointer;padding:6px">Cancel</div>
      <div style="color:#fff;font-size:15px;font-weight:700">${isAvatar ? 'Adjust Photo' : 'Adjust Cover'}</div>
      <div onclick="confirmCropPreview()" style="color:#FF2D7A;font-size:15px;font-weight:700;cursor:pointer;padding:6px">Done</div>
    </div>

    <!-- Crop area -->
    <div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;background:#000">
      <div id="crop-viewport" style="
        width:${isAvatar ? '280px' : '100%'};
        max-width:${isAvatar ? '280px' : '380px'};
        aspect-ratio:${aspectRatio};
        ${shapeStyle};
        overflow:hidden;
        position:relative;
        touch-action:none;
        cursor:grab;
        box-shadow:0 0 0 4000px rgba(0,0,0,0.75);
        border:2px solid rgba(255,255,255,0.3);
      ">
        <img id="crop-image" src="${url}" style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%) scale(1);
          max-width:none;
          user-select:none;
          -webkit-user-drag:none;
          pointer-events:none;
        ">
      </div>
    </div>

    <!-- Bottom controls -->
    <div style="padding:20px 24px 32px;background:#0A0A0A;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;align-items:center;gap:14px">
        <span style="color:#8A8A8A;font-size:12px">🔍</span>
        <input id="crop-zoom-slider" type="range" min="100" max="300" value="100"
          oninput="updateCropZoom(this.value)"
          style="flex:1;accent-color:#FF2D7A;height:4px">
        <span style="color:#8A8A8A;font-size:16px">🔍</span>
      </div>
      <div style="text-align:center;color:#666;font-size:11px;margin-top:12px">
        Drag to reposition • Pinch or slide to zoom
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Image load hone ke baad initial fit calculate karo
  const imgEl = document.getElementById('crop-image');
  _cropState.imgEl = imgEl;

  imgEl.onload = () => {
    const viewport = document.getElementById('crop-viewport');
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const iw = imgEl.naturalWidth;
    const ih = imgEl.naturalHeight;

    // Cover-fit calculate karo (image viewport ko poora cover kare)
    const scaleToFit = Math.max(vw / iw, vh / ih);
    _cropState.minScale = scaleToFit;
    _cropState.scale = scaleToFit;

    imgEl.style.width = iw + 'px';
    imgEl.style.height = ih + 'px';
    imgEl.style.transform = `translate(-50%,-50%) scale(${scaleToFit})`;
  };

  _setupCropDragHandlers();
};
