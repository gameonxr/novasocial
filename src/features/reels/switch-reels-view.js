// switchReelsView — extracted from index.html
// Owner SHA-256: f70fd4068cc1cae6c5d64754e4ac3e1546a3157809ae3508c3028dcb9f4adcec
// Classic script — exposes window.switchReelsView

window.switchReelsView = function switchReelsView(mode) {
  if (window._reelsViewMode === mode) return;
  window._reelsViewMode = mode;

  // Update toggle button styles
  const reelsBtn = document.getElementById('toggle-reels-btn');
  const notesBtn = document.getElementById('toggle-notes-btn');
  if (reelsBtn && notesBtn) {
    if (mode === 'reels') {
      reelsBtn.style.color = '#FF2D7A';
      reelsBtn.style.background = 'rgba(255,45,122,0.15)';
      notesBtn.style.color = 'rgba(255,255,255,0.5)';
      notesBtn.style.background = 'transparent';
    } else {
      notesBtn.style.color = '#00E5FF';
      notesBtn.style.background = 'rgba(0,229,255,0.12)';
      reelsBtn.style.color = 'rgba(255,255,255,0.5)';
      reelsBtn.style.background = 'transparent';
    }
  }

  // Show/hide containers
  const reelsWrap = document.getElementById('rwrap');
  let notesWrap = document.getElementById('notes-feed-container');

  if (mode === 'reels') {
    // Show reels, hide notes
    if (reelsWrap) reelsWrap.style.display = '';
    if (notesWrap) notesWrap.style.display = 'none';
    // Resume current reel video
    try {
      const v = document.getElementById('rv-' + currentReelIdx);
      if (v) { v.muted = reelsMuted; v.play().catch(()=>{}); }
    } catch(_) {}
  } else {
    // Show notes, hide reels (but don't destroy — preserve video state)
    if (reelsWrap) reelsWrap.style.display = 'none';
    // Pause all reel videos
    document.querySelectorAll('.rvid').forEach(v => { try { v.pause(); } catch(_) {} });

    // Create notes container if it doesn't exist yet
    if (!notesWrap) {
      notesWrap = document.createElement('div');
      notesWrap.id = 'notes-feed-container';
      notesWrap.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#000;padding-top:100px';
      // Insert into the persistent container
      const persistent = document.getElementById('reels-persistent-container');
      if (persistent) persistent.appendChild(notesWrap);
      else document.getElementById('screen').appendChild(notesWrap);

      // Setup scroll listener for pagination
      notesWrap.addEventListener('scroll', () => {
        if (window._notesFeedLoading || !window._notesFeedHasMore) return;
        if (notesWrap.scrollTop + notesWrap.clientHeight > notesWrap.scrollHeight - 400) {
          loadNotesFeed(window._notesFeedOffset);
        }
      }, { passive: true });
    }

    notesWrap.style.display = 'block';

    // ── Always show toggle in Notes mode (even if it was auto-hidden during Reels) ──
    const togglePill = document.getElementById('reels-toggle-pill');
    if (togglePill) {
      togglePill.style.opacity = '1';
      togglePill.style.transform = 'translateX(-50%) translateY(0)';
      togglePill.style.pointerEvents = '';
    }

    // Load first page if not yet loaded
    if (window._notesFeedOffset === 0 && window._notesFeedSeenUsers === null) {
      window._notesFeedSeenUsers = new Set();
      notesWrap.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spin" style="width:28px;height:28px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div>';
      loadNotesFeed(0);
    }
  }
};
