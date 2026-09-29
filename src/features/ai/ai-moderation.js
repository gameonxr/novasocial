/**
 * NovaSocial AI Auto-Moderation and Ultra initialization feature.
 *
 * Loaded before the inline application script to preserve the original patch
 * timing for comment moderation and Nova Ultra initialization.
 */
// ── AI AUTO-MODERATION ──────────────────────────────────────
function moderateContent(text){
  const t = text.toLowerCase();
  const banned = ['spam', 'scam', 'fake', 'abuse', 'hate', 'violent'];
  for(const word of banned){
    if(t.includes(word)){
      return {flagged: true, reason: word};
    }
  }
  return {flagged: false};
}

// Patch sendCmt to auto-moderate
const _origSendCmt = window.sendCmt;
if(typeof _origSendCmt === 'function'){
  window.sendCmt = function(pid){
    const inp = document.getElementById('ci-'+pid);
    if(inp){
      const mod = moderateContent(inp.value);
      if(mod.flagged){
        toast('⚠️ Comment flagged for: ' + mod.reason + '. Please follow community guidelines.');
        return;
      }
    }
    return _origSendCmt.apply(this, arguments);
  };
}

// Initialize everything
function initUltraFeatures(){
  initDynamicUI();
  // Load saved mood
  try { currentMood = localStorage.getItem('nova-current-mood') || 'default'; } catch(e) {}
}

// Patch initNovaFeatures to also init ultra features
const _origInitNova_v2 = window.initNovaFeatures;
if(typeof _origInitNova === 'function'){
  window.initNovaFeatures = function(){
    _origInitNova.apply(this, arguments);
    initUltraFeatures();
  };
}
