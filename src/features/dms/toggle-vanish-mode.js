// Vanish-mode UI toggle; DMs message rendering remains inline.
function toggleVanishMode() {
  window._vanishMode = !window._vanishMode;
  const btn = document.getElementById('vanish-btn');
  if(btn) btn.innerHTML = window._vanishMode ? '👻' : '🔓';
  const mlist = document.getElementById('mlist');
  if(mlist) {
    mlist.style.background = window._vanishMode ? "repeating-linear-gradient(45deg, #000, #000 10px, #0a0a0a 10px, #0a0a0a 20px)" : "#000";
  }
  toast(window._vanishMode ? 'Vanish Mode ON 👻' : 'Vanish Mode OFF');
}
