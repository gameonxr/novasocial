/**
 * NovaSocial Reels UI enhancement feature.
 *
 * Extracted as a classic script with its immediate style initializer preserved;
 * the protected Reels renderer and swipe system remain inline.
 */
// ── Reels UI Enhancement (better layout) ──────────────────────────────────────
function enhanceReelsUI(){
  // Add subtle improvements to reels — better overlay, smoother animations
  const style = document.createElement('style');
  style.textContent = `
    .reel-card { transition: transform 0.3s ease; }
    .reel-card:active { transform: scale(0.98); }
    .reel-overlay { background: linear-gradient(180deg, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%); }
  `;
  document.head.appendChild(style);
}

// Initialize
enhanceReelsUI();



// ═══════════════════════════════════════════════════════════════
