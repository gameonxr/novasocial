window.confirmCropPreview = async function() {
  const viewport = document.getElementById('crop-viewport');
  const imgEl = document.getElementById('crop-image');
  if(!viewport || !imgEl || !_cropState.file) {
    closeCropPreview();
    return;
  }
  try {
    const isAvatar = _cropState.cropType === 'avatar';
    const outputSize = isAvatar ? 500 : { w: 1200, h: 450 };
    const canvas = document.createElement('canvas');
    if(isAvatar) {
      canvas.width = outputSize;
      canvas.height = outputSize;
    } else {
      canvas.width = outputSize.w;
      canvas.height = outputSize.h;
    }
    const ctx = canvas.getContext('2d');
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const iw = imgEl.naturalWidth;
    const ih = imgEl.naturalHeight;
    // Viewport ke visible portion ko original image coordinates mein convert karo
    const scaledW = iw * _cropState.scale;
    const scaledH = ih * _cropState.scale;
    const visibleLeftInScaled = (scaledW - vw) / 2 - _cropState.offsetX;
    const visibleTopInScaled = (scaledH - vh) / 2 - _cropState.offsetY;
    const srcX = visibleLeftInScaled / _cropState.scale;
    const srcY = visibleTopInScaled / _cropState.scale;
    const srcW = vw / _cropState.scale;
    const srcH = vh / _cropState.scale;
    ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
    // Canvas ko blob mein convert karo
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
    const croppedFile = new File([blob], _cropState.file.name || 'cropped.jpg', { type: 'image/jpeg' });
    const callback = _cropState.onConfirm;
    closeCropPreview();
    if(callback) callback(croppedFile);
  } catch(e) {
    console.error('Crop confirm error:', e);
    toast('❌ Crop failed, original photo use ho rahi hai');
    const callback = _cropState.onConfirm;
    const originalFile = _cropState.file;
    closeCropPreview();
    if(callback) callback(originalFile);
  }
};
