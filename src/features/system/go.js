// go — extracted from index.html
// Owner SHA-256: 26fbf56f8dc14774472ee2f4756fd7003befc6439ce72392bac8bdb9215c3068
// Classic script — exposes window.go

window.go = function go(tab){
  // Leaving an open chat from a bottom-nav tap must cancel chat-only realtime
  // work before the DMs cache is considered again.
  if (window._chatScreenActive && tab !== 'dms') {
    window._chatScreenActive = false;
    if (window.chatSubscription) {
      db.removeChannel(window.chatSubscription);
      window.chatSubscription = null;
    }
    if (window.typingSub) {
      db.removeChannel(window.typingSub);
      window.typingSub = null;
    }
  }

  _renderGeneration++; // 🛡️ Race condition fix: invalidate any in-flight async renders

  // ── SUBTLE TAB-SWITCH FADE (Instagram-style cross-dissolve) ──
  // Apply a brief partial fade-out BEFORE the content swap, then fade back to 1
  // AFTER. This is purely visual — it does NOT delay or block any of the existing
  // logic (scroll restoration, Reels persistent-container restore, renderX calls).
  // The fade-back-to-1 step runs via requestAnimationFrame inside a finally block,
  // so it fires on EVERY return path (cache-restore early return, cache-miss fall-
  // through, error catch). #screen can never get stuck at partial opacity.
  const _fadeScr = document.getElementById('screen');
  if (_fadeScr) {
    _fadeScr.style.transition = 'opacity 0.16s ease';
    _fadeScr.style.opacity = '0.15';  // deeper dip — more perceptible, still not a jarring full blackout
  }

  try {
    haptic(10);
    clearOverlays();
    pauseAllVideos();

    // ── REELS PERSISTENCE: agar reels se bahar ja rahe hain, container ko body mein park karke hide karo ──
    // (DOM destroy nahi hoga — video state + currentReelIdx preserve rahega jab wapas aao)
    const reelsContainer = document.getElementById('reels-persistent-container');
    if(reelsContainer && curTab === 'reels' && tab !== 'reels'){
      try {
        document.body.appendChild(reelsContainer); // temporarily body mein park karo
        reelsContainer.style.display = 'none';
        // ── SPLIT-VIEW FIX (LEAVING REELS): reset #screen's overflow back to normal-scroll ──
        // behavior so other tabs (Home/DMs/Explore/etc) can scroll natively again.
        // Reels sets overflow:hidden + scrollTop:0; if we don't undo it here, other tabs
        // would inherit hidden overflow and be unscrollable.
        const leavingScr = document.getElementById('screen');
        if(leavingScr){ leavingScr.style.overflow = 'auto'; leavingScr.scrollTop = 0; }
      } catch(e) { console.warn('[Reels] park-fail:', e.message); }
    }

    // ── PEHLE: PURANE tab ka state cache mein save karo (agar cacheable hai) ──
    if (curTab && curTab !== tab) {
      _saveTabToCache(curTab);

      // Reels tab se bahar jaate waqt current reel index save karo (backup for restore)
      if (curTab === 'reels' && typeof currentReelIdx !== 'undefined') {
        window._savedReelIndex = currentReelIdx;
      }
    }

    // NAV-STACK: clear stack on tab switch, push new tab entry
    if(!window._navPopInProgress){
      clearNavStack();
      pushNavState('tab', tab, function(){ go('home'); });
    }
    curTab=tab;
    // ── Part 13 Fix: Save last navigated tab to localStorage for crash-recovery restore ──
    // Only saves main bottom-nav tabs (no modals/settings — those don't make sense to auto-restore)
    try {
      const RESTORABLE_TABS = ['home', 'explore', 'reels', 'dms', 'profile'];
      if (RESTORABLE_TABS.includes(tab)) {
        localStorage.setItem('nova-last-screen', JSON.stringify({ tab: tab, ts: Date.now() }));
      }
    } catch(e) {}
    document.querySelectorAll('.nb').forEach(b=>{
      const on=b.dataset.t===tab;
      b.classList.toggle('on',on);
    });
    updateNavIcons(tab);
    const scr=document.getElementById('screen');

    // ── CACHE CHECK: agar valid cache hai, INSTANT dikhao (no skeleton, no reload feel) ──
    const restoredFromCache = _tryRestoreFromCache(tab);

    if (restoredFromCache) {
      // Content turant dikh gaya. Ab background mein silently fresh data check karo
      // (stale-while-revalidate pattern — modern apps jaisa)
      _silentBackgroundRefresh(tab);
      return; // Skeleton/loading state skip — seedha yahin se return
    }

    // ── CACHE NAHI MILA / EXPIRED — normal skeleton + fresh load flow ──
    let skelHtml = '';
    if(tab === 'home') {
      for(let i=0; i<3; i++) skelHtml += '<div class="skel-card"><div class="skel-hdr"><div class="skel-av shimmer"></div><div class="skel-line shimmer"></div></div><div class="skel-media shimmer"></div><div class="skel-acts"><div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div></div></div>';
    } else if(tab === 'profile') {
      skelHtml = '<div style="padding:16px;"><div style="display:flex;gap:20px;align-items:center;"><div class="skel-av shimmer" style="width:88px;height:88px;"></div><div style="flex:1;display:flex;gap:20px;"><div class="skel-line shimmer" style="width:30%;height:40px;"></div><div class="skel-line shimmer" style="width:30%;height:40px;"></div><div class="skel-line shimmer" style="width:30%;height:40px;"></div></div></div><div class="skel-line shimmer" style="width:80%;margin-top:20px;height:12px;"></div><div class="skel-line shimmer" style="width:60%;margin-top:8px;height:12px;"></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:20px;">';
      for(let i=0; i<9; i++) skelHtml += '<div class="skel-media shimmer" style="border-radius:0;"></div>';
      skelHtml += '</div></div>';
    } else if(tab === 'reels') {
      skelHtml = '<div style="height:100vh;background:#000;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:20px;">';
      skelHtml += '<div class="shimmer" style="position:absolute;inset:0;background:#111;opacity:0.5;"></div>';
      skelHtml += '<div style="position:relative;z-index:2;display:flex;flex-direction:column;gap:10px;width:60%;">';
      skelHtml += '<div class="shimmer" style="width:100px;height:20px;border-radius:4px;"></div>';
      skelHtml += '<div class="shimmer" style="width:150px;height:12px;border-radius:4px;"></div>';
      skelHtml += '</div><div style="position:relative;z-index:2;display:flex;gap:20px;margin-top:20px;">';
      skelHtml += '<div class="shimmer" style="width:30px;height:30px;border-radius:50%;"></div>';
      skelHtml += '<div class="shimmer" style="width:30px;height:30px;border-radius:50%;"></div>';
      skelHtml += '<div class="shimmer" style="width:30px;height:30px;border-radius:50%;"></div>';
      skelHtml += '</div></div>';
    } else if(tab === 'notifs') {
      for(let i=0; i<8; i++) skelHtml += '<div style="display:flex;gap:14px;padding:18px;margin:10px 12px;border-radius:14px;background:#0c0c0c;"><div class="skel-av shimmer" style="width:44px;height:44px;"></div><div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:8px;"><div class="skel-line shimmer" style="width:60%;height:12px;"></div><div class="skel-line shimmer" style="width:40%;height:10px;"></div></div></div>';
    } else if(tab === 'explore') {
      skelHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;">';
      for(let i=0; i<9; i++) skelHtml += '<div class="skel-media shimmer" style="border-radius:0"></div>';
      skelHtml += '</div>';
    } else if(tab === 'dms') {
      for(let i=0; i<6; i++) skelHtml += '<div style="display:flex;gap:14px;padding:14px 16px;margin:10px 12px;border-radius:14px;background:#0c0c0c;"><div class="skel-av shimmer" style="width:54px;height:54px;"></div><div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:8px;"><div class="skel-line shimmer" style="width:40%"></div><div class="skel-line shimmer" style="width:80%"></div></div></div>';
    } else {
      skelHtml = '<div class="ldiv"><div class="spin"></div></div>';
    }

    scr.innerHTML=skelHtml;
    scr.scrollTop=0;
    scr.style.overflow='auto';
    scr.style.display='block';

    if(tab==='home') renderHome();
    else if(tab==='explore') renderExplore();
    else if(tab==='reels') renderReels();
    else if(tab==='dms') renderDMs();
    else if(tab==='notifs') renderNotifs();
    else if(tab==='profile') renderProfile();
  } catch(e) {
    console.error("Navigation Error:", e);
    document.getElementById('screen').innerHTML = '<div style="text-align:center;padding:40px;color:#E1306C;">App me error aaya hai. Console check karein.</div>';
  } finally {
    // ── FADE BACK TO FULL OPACITY (runs on EVERY return path) ──
    // finally block fires whether go() returns early (cache-restore), falls through
    // (cache miss + render), or throws (catch block). #screen can never get stuck at 0.4.
    //
    // requestAnimationFrame ensures the fade-back runs on the NEXT frame — after the
    // new content has been placed in the DOM (so the fade-in visually reveals the new
    // content, not the old). The fade itself is purely visual — it does NOT delay or
    // block any existing scroll-restoration (which happens via its own double-rAF in
    // _tryRestoreFromCache, timed independently).
    if (_fadeScr) {
      requestAnimationFrame(() => {
        _fadeScr.style.opacity = '1';
      });
    }
  }
};
