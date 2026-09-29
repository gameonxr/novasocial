// Segment-picker drag-window interaction helper.
function setupSegmentDragWindow(previewUrl){
  const track = document.getElementById('waveform-track');
  const win = document.getElementById('drag-window');
  if(!track || !win) return;

  const WINDOW_SEC = 8;
  const TOTAL_SEC = 30;
  let dragging = false, startX = 0, startLeftPercent = 0;

  function setWindowPosition(leftPercent){
    const maxLeftPercent = 100 - (WINDOW_SEC/TOTAL_SEC*100);
    leftPercent = Math.max(0, Math.min(maxLeftPercent, leftPercent));
    win.style.left = leftPercent + '%';
    const startSec = Math.round((leftPercent/100) * TOTAL_SEC);
    window._segmentStartSec = startSec;
    const endSec = startSec + WINDOW_SEC;
    document.getElementById('segment-time-label').textContent =
      `0:${String(startSec).padStart(2,'0')} - 0:${String(endSec).padStart(2,'0')}`;
    if(_segmentAudio && !_segmentAudio.paused) _segmentAudio.currentTime = startSec;
  }

  win.addEventListener('touchstart', e=>{
    dragging = true;
    startX = e.touches[0].clientX;
    startLeftPercent = parseFloat(win.style.left) || 0;
    win.style.cursor = 'grabbing';
  }, {passive:true});

  win.addEventListener('touchmove', e=>{
    if(!dragging) return;
    e.preventDefault();
    const trackWidth = track.offsetWidth;
    const dx = e.touches[0].clientX - startX;
    const dxPercent = (dx/trackWidth)*100;
    setWindowPosition(startLeftPercent + dxPercent);
  }, {passive:false});

  win.addEventListener('touchend', ()=>{ dragging=false; win.style.cursor='grab'; }, {passive:true});

  setWindowPosition(0);
}
