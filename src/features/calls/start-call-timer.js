// startCallTimer — extracted from index.html
// Owner SHA-256: 32cb42a7063a2fca16c20d6902a68992c383080e94d36c61b57cc431433972cd
// Classic script — exposes window.startCallTimer

window.startCallTimer = function startCallTimer() {
  if (window._callRingTimeout) { clearTimeout(window._callRingTimeout); window._callRingTimeout = null; }
  _callState.startTime = Date.now(); const timerEl = document.getElementById('nova-call-timer'); if (timerEl) timerEl.style.display = 'block';
  if (_callState.timerInterval) clearInterval(_callState.timerInterval);
  _callState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - _callState.startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const timerText = mins + ':' + secs;
    const el = document.getElementById('nova-call-timer'); if (el) el.textContent = timerText;
    const bubbleTimer = document.getElementById('nova-call-bubble-timer'); if(bubbleTimer) bubbleTimer.textContent = `${mins}:${secs}`;
    // ── Compact badge timer (video call mein top-left badge) ──
    const compactTimerEl = document.getElementById('nova-call-compact-timer');
    if (compactTimerEl) compactTimerEl.textContent = timerText;
  }, 1000);
};
