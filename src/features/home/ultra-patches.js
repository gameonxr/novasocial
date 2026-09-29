// Nova Ultra v4/v5 feature patches — extracted from the index.html inline application script
// Region SHA-256: 89ef28fd0f429b1b205230e6c7fb5118edafe29c0e1a12a575c8eaf1e2056476
// Classic script — top-level patch overrides for window owners defined by earlier
// modules (nova-ai.js, local-ai-response.js, ai-generators.js, smart-feed.js,
// nova-universe.js). The toggleLike and initNovaFeatures guards are intentionally
// inert when their targets load after this module (preserved pre-split behavior).
// Split 2026-09-29 (architecture migration): the AI patch blocks moved to
// src/features/ai/ultra-patches.js (loaded at the END of the lazy ai chunk so
// the ACTIVE AI patches keep applying); the Nova Universe hub block moved to
// src/features/nova-universe/ultra-patches.js. This file keeps the blocks whose
// behavior is tied to STARTUP position: the loadMoodFeed patch (target =
// smart-feed.js, eager) and the initNovaFeatures block, which is INERT today
// because nova-init.js loads AFTER this file — the startup manifest preserves
// that ordering (this file must stay before the post-inline scripts).

// ═══════════════════════════════════════════════════════════════════════
// PARTICLE EFFECT ON LIKE (Futuristic)
// ═══════════════════════════════════════════════════════════════════════

// Override toggleLike to add particles (call original then particles)

// ── PARTICLE EFFECT ON LIKE (Futuristic) — inert by original construction ──
const _origToggleLike = window.toggleLike;
if(typeof _origToggleLike === 'function'){
  // Already defined elsewhere; we'll patch via event delegation below
}

// ── SMART MOOD FEED (Functional - actually filters posts) ──────────────────────────────────────

// Patch loadMoodFeed to use functional filtering (avoid redeclaration of currentMood)
if(typeof window.loadMoodFeed === 'function'){
  const _origLoadMoodFeed_v2 = window.loadMoodFeed;
  window.loadMoodFeed = function(){
    toast(`${window.currentMood || 'default'} feed applying... 🧠`);
    go('home');
    setTimeout(() => {
      setTimeout(() => {
        const feedList = document.getElementById('feed-list');
        if(feedList){
          const moodChip = document.createElement('div');
          moodChip.style.cssText = 'padding:12px 14px;margin:10px 12px;background:linear-gradient(135deg,rgba(122,253,255,0.1),rgba(252,0,124,0.1));border:1px solid rgba(122,253,255,0.2);border-radius:14px;font-size:12px;color:#fff;display:flex;align-items:center;gap:8px';
          moodChip.innerHTML = `🧠 <b>Smart Feed:</b> ${esc(window.currentMood || 'default')} mood active. <span onclick="showSmartFeed()" style="color:#7afdff;cursor:pointer;margin-left:auto">Change →</span>`;
          feedList.insertBefore(moodChip, feedList.firstChild);

          if((window.currentMood || 'default') !== 'default'){
            applyMoodToFeed(window.currentMood);
          }
        }
      }, 500);
    }, 1500);
  };
}

// ── AUTO-DETECT INTERESTS ON LOGIN ──────────────────────────────────────
const _origInitNovaFeatures2 = window.initNovaFeatures;
if(typeof _origInitNovaFeatures2 === 'function'){
  window.initNovaFeatures = function(){
    _origInitNovaFeatures2.apply(this, arguments);
    // Update interests in background after 5 seconds
    setTimeout(() => {
      if(ME && typeof updateMyInterests === 'function'){
        updateMyInterests();
      }
    }, 5000);
  };
}

