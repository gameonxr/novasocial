// Browser video compression helper.
async function _compressVideo(file, config) {
  if(file.size < 3 * 1024 * 1024) { console.log('📹 Video already small, skipping compression'); return file; }
  return new Promise((resolve) => {
    const video = document.createElement('video'); const url = URL.createObjectURL(file);
    video.src = url; video.muted = true; video.playsInline = true;
    video.onloadedmetadata = async () => {
      try {
        const duration = Math.min(video.duration, config.maxDuration || 60);
        let vw = video.videoWidth, vh = video.videoHeight;
        const maxW = config.maxWidth || 720, maxH = config.maxHeight || 1280;
        if(vw > maxW || vh > maxH) { const ratio = Math.min(maxW / vw, maxH / vh); vw = Math.round(vw * ratio); vh = Math.round(vh * ratio); }
        const canvas = document.createElement('canvas'); canvas.width = vw; canvas.height = vh;
        const ctx = canvas.getContext('2d'); const canvasStream = canvas.captureStream(30);
        try { const aCtx = new (window.AudioContext || window.webkitAudioContext)(); const src = aCtx.createMediaElementSource(video);
          const dest = aCtx.createMediaStreamDestination(); src.connect(dest); src.connect(aCtx.destination);
          const aTrack = dest.stream.getAudioTracks()[0]; if(aTrack) canvasStream.addTrack(aTrack); } catch(e) {}
        const mimeTypes = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
        const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
        const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: config.videoBitrate || 1200000, audioBitsPerSecond: config.audioBitrate || 128000 });
        const chunks = [];
        recorder.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => { URL.revokeObjectURL(url); const blob = new Blob(chunks, { type: mimeType });
          const compressed = new File([blob], _generateFileName(ME?.id, 'video'), { type: mimeType });
          console.log(`📹 ${(file.size/1024/1024).toFixed(1)}MB → ${(compressed.size/1024/1024).toFixed(1)}MB`); resolve(compressed); };
        recorder.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        video.currentTime = 0; video.muted = false; await video.play(); recorder.start(200);
        let drawing = true; (function draw() { if(!drawing) return; ctx.drawImage(video, 0, 0, vw, vh); requestAnimationFrame(draw); })();
        setTimeout(() => { drawing = false; video.pause(); try { recorder.stop(); } catch(e) {} }, duration * 1000);
      } catch(err) { console.error('Video compression error:', err); URL.revokeObjectURL(url); resolve(file); }
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  });
}
