/**
 * NovaSocial like-particle and theme-panel effects patch.
 *
 * Loaded after the inline application script because it wraps the already
 * defined toggleLike and uses the inline spawnLikeParticles helper.
 */
// PARTICLE EFFECT - Patch toggleLike
// ═══════════════════════════════════════════════════════════════════════
const _origToggleLikeOrig = window.toggleLike;
if(typeof _origToggleLikeOrig === 'function'){
  window.toggleLike = async function(pid){
    const el = document.getElementById('lbtn-'+pid);
    const wasLiked = el?.dataset?.liked === 'true';
    await _origToggleLikeOrig.apply(this, arguments);
    // Spawn particles when liking (not unliking)
    const nowLiked = el?.dataset?.liked === 'true';
    if(nowLiked && !wasLiked && el){
      spawnLikeParticles(el);
    }
  };
}

// Close theme picker when clicking outside
document.addEventListener('click', (e)=>{
  const panel = document.getElementById('theme-panel');
  const fab = document.querySelector('.theme-picker-fab');
  if(panel?.classList.contains('show') && !panel.contains(e.target) && !fab?.contains(e.target)){
    panel.classList.remove('show');
  }
});



// ═══════════════════════════════════════════════════════════════
