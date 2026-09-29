// Browser image compression helper.
async function _compressImage(file, config) {
  return new Promise((resolve) => {
    if(file.size < 200 * 1024) { resolve(file); return; }
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const maxW = config.maxWidth || 1080; const maxH = config.maxHeight || 1080;
      if(width > maxW || height > maxH) { const ratio = Math.min(maxW / width, maxH / height); width = Math.round(width * ratio); height = Math.round(height * ratio); }
      canvas.width = width; canvas.height = height;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
      const format = config.outputFormat || 'image/webp'; const maxBytes = (config.maxSizeMB || 1.5) * 1024 * 1024;
      const tryQ = (q) => { canvas.toBlob((blob) => {
        if(!blob) { resolve(file); return; }
        if(blob.size > maxBytes && q > 0.45) { tryQ(parseFloat((q - 0.08).toFixed(2))); }
        else { const compressed = new File([blob], _generateFileName(ME?.id, 'image'), { type: format });
          console.log(`📸 ${(file.size/1024).toFixed(0)}KB → ${(compressed.size/1024).toFixed(0)}KB (${Math.round(compressed.size/file.size*100)}%)`); resolve(compressed); }
      }, format, q); };
      tryQ(config.quality || 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); }; img.src = url;
  });
}
