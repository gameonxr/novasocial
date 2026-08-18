// Isolated crop preview close/reset helper.
function closeCropPreview() {
  document.getElementById('nova-crop-modal')?.remove();
  _cropState = { file: null, imgEl: null, scale: 1, minScale: 1, offsetX: 0, offsetY: 0, startX: 0, startY: 0, isDragging: false, cropType: 'avatar', onConfirm: null };
}
