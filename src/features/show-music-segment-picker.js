// Note-music segment-picker renderer.
function showMusicSegmentPicker(title, artist, artwork, previewUrl){
  stopAllPreviewAudio();
  document.getElementById('music-search-panel')?.remove();
  const panel = document.createElement('div');
  panel.id = 'music-segment-panel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0a;display:flex;flex-direction:column;padding:20px';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div onclick="cancelSegmentPicker()" style="cursor:pointer;color:#aaa;">✕</div>
      <div style="font-weight:700;color:#fff">Choose Part</div>
      <div onclick='confirmMusicSegment(${JSON.stringify(title)},${JSON.stringify(artist)},${JSON.stringify(artwork)},${JSON.stringify(previewUrl)})' style="cursor:pointer;color:#E1306C;font-weight:700;font-size:14px">Done</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;position:relative">
      <div style="position:absolute;inset:-20px;background-image:url('${artwork.replace('60x60','300x300')}');background-size:cover;background-position:center;filter:blur(40px) brightness(0.3);z-index:-1"></div>
      <img src="${artwork.replace('60x60','300x300')}" style="width:180px;height:180px;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,0.6)">
      <div style="text-align:center">
        <div style="font-weight:800;font-size:17px;color:#fff">${title}</div>
        <div style="font-size:13px;color:#999;margin-top:4px">${artist}</div>
      </div>
      <div onclick='toggleSegmentPreview(${JSON.stringify(previewUrl)})' id="segment-play-btn" style="width:68px;height:68px;border-radius:50%;background:${GRAD};display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 30px rgba(225,48,108,0.45)">
        <svg id="segment-play-icon" width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
      <div style="width:100%;max-width:300px;padding:0 16px">
        <div id="waveform-track" style="position:relative;display:flex;align-items:center;gap:2px;height:44px;margin-bottom:14px;background:#111;border-radius:12px;padding:0 4px;overflow:hidden">
          ${Array.from({length:50}).map((_,i)=>`<div style="flex:1;background:rgba(255,255,255,0.18);border-radius:2px;height:${10+Math.random()*24}px" class="waveform-bar"></div>`).join('')}
          <div id="drag-window" style="position:absolute;top:0;bottom:0;left:0;width:26.6%;background:rgba(225,48,108,0.28);border:2px solid #E1306C;border-radius:10px;cursor:grab;touch-action:none"></div>
        </div>
        <div style="display:flex;justify-content:space-between;color:#555;font-size:10px"><span>0:00</span><span id="segment-time-label" style="color:#E1306C;font-weight:700">0:00 - 0:08</span><span>0:30</span></div>
      </div>
    </div>`;
  document.body.appendChild(panel);
  window._segmentStartSec = 0;
  setupSegmentDragWindow(previewUrl);
}
