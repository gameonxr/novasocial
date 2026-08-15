// Hardened: file:// safety + timing fix + persistent diagnostics + large buffer
// ═══════════════════════════════════════════════════════════════
window.navStack = [];
window._navPopInProgress = false;
window._exitTimer = null;
window._historyApiBroken = false; // detect if pushState isn't working

// ── PERSISTENT LOGGER — localStorage mein likhta hai taaki page crash/navigate-away ──
// hone ke baad bhi log survive kare aur baad mein dekha ja sake
function _navLog(label, extra) {
  try {
    const logs = JSON.parse(localStorage.getItem('_navDebugLog') || '[]');
    logs.push({
      t: Date.now(),
      label: label,
      stack: window.navStack ? window.navStack.map(function(e){ return e.type + ':' + e.id; }) : [],
      historyLength: history.length,
      historyState: history.state,
      extra: extra || null
    });
    if (logs.length > 200) logs.splice(0, logs.length - 200);
    localStorage.setItem('_navDebugLog', JSON.stringify(logs));
  } catch(e) {}
  console.log('%c[NAV] ' + label, 'color:#00ff88;font-weight:bold',
    window.navStack ? window.navStack.map(function(e){ return e.type + ':' + e.id; }).join(' -> ') : '',
    '| history.length=' + history.length);
}

window.showNavDebugLog = function() {
  const logs = JSON.parse(localStorage.getItem('_navDebugLog') || '[]');
  console.table(logs.map(function(l){ return {
    time: new Date(l.t).toLocaleTimeString() + '.' + (l.t % 1000),
    label: l.label,
    stack: l.stack.join(' -> '),
    historyLen: l.historyLength
  };}));
  return logs;
};

window.clearNavDebugLog = function() {
  localStorage.removeItem('_navDebugLog');
  console.log('Nav debug log cleared');
};

function pushNavState(type, id, closeFn, data) {
  _navLog('PUSH ' + type + ':' + id + ' (before push)');
  window.navStack.push({ type: type, id: id, closeFn: closeFn, data: data || {} });
  _navLog('PUSH ' + type + ':' + id + ' (after push)');
  if (!window._navPopInProgress && 'pushState' in history && !window._historyApiBroken) {
    try {
      history.pushState({ navDepth: window.navStack.length }, '', location.href);
    } catch(e) {
      console.error('[NavStack] pushState failed — history API restricted (file:// protocol?)', e);
      window._historyApiBroken = true;
    }
  }
}

function popNavState() {
  if (_noteViewAudio) { _noteViewAudio.pause(); }
  if (window.navStack.length === 0) { _navLog('POP called but stack empty'); return false; }
  _navLog('POP (before pop)');
  var entry = window.navStack.pop();
  _navLog('POP Popping entry: ' + entry.type + ':' + entry.id);
  window._navPopInProgress = true;
  try {
    if (entry.closeFn) entry.closeFn();
  } catch(e) {
    console.error('[NavStack] Error while closing layer:', entry.type, entry.id, e);
  }
  window._navPopInProgress = false;
  _navLog('POP (after closeFn ran)');
  return true;
}

function clearNavStack() {
  _navLog('CLEAR (before)');
  window.navStack = [];
  _navLog('CLEAR (after)');
}

function safeRepushHistoryState(depth) {
  if (window._historyApiBroken || !('pushState' in history)) return;
  try {
    history.pushState({ navDepth: depth }, '', location.href);
  } catch(e) {
    console.error('[NavStack] Re-push failed:', e);
    window._historyApiBroken = true;
    return;
  }
  setTimeout(function(){
    if (history.state && history.state.navDepth !== depth) {
      try { history.pushState({ navDepth: depth }, '', location.href); }
      catch(e){ console.error('[NavStack] Retry re-push failed:', e); }
    }
  }, 0);
  // BUFFER TOP-UP: agar buffer bahut kam reh gaya hai, top-up karo (rapid back-press safety)
  if (history.length < 10) {
    try {
      for (let i = 0; i < 15; i++) {
        history.pushState({ navDepth: depth, buffer: true }, '', location.href);
      }
      _navLog('BUFFER TOP-UP: +15 states, history.length now=' + history.length);
    } catch(e) {}
  }
}

// Initialize on script load — LARGE HISTORY BUFFER (crash-proof against rapid back-press race)
if ('pushState' in history) {
  try {
    for (let i = 0; i < 25; i++) {
      history.pushState({ navDepth: 0, buffer: true, idx: i }, '', location.href);
    }
    _navLog('INIT: 25 buffer states pushed, history.length=' + history.length);
  } catch(e) {
    console.error('[NavStack] CRITICAL: history.pushState blocked entirely.', e);
    window._historyApiBroken = true;
    _navLog('INIT FAILED', {error: e.message});
  }

  window.addEventListener('popstate', function(e) {
    _navLog('POPSTATE FIRED', {state: e.state});
    if (window._historyApiBroken) return;
    if (popNavState()) {
      safeRepushHistoryState(window.navStack.length);
    } else {
      if (curTab !== 'home') {
        go('home');
        safeRepushHistoryState(0);
      } else {
        if (window._exitTimer) {
          clearTimeout(window._exitTimer);
          window._exitTimer = null;
        } else {
          toast('Wapas dabao app band karne ke liye');
          window._exitTimer = setTimeout(function() { window._exitTimer = null; }, 2000);
          safeRepushHistoryState(0);
        }
      }
    }
  });
} else {
  console.error('[NavStack] History API not supported at all in this browser.');
}
