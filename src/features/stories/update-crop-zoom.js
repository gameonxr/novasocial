// Isolated crop zoom UI helper.
function updateCropZoom(sliderVal) {
  const zoomPercent = parseInt(sliderVal) / 100;
  _cropState.scale = _cropState.minScale * zoomPercent;

  const imgEl = document.getElementById('crop-image');
  if(imgEl) {
    imgEl.style.transform = `translate(calc(-50% + ${_cropState.offsetX}px), calc(-50% + ${_cropState.offsetY}px)) scale(${_cropState.scale})`;
  }
}
