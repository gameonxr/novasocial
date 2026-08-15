// Shared UI helpers — classic script, preserves legacy global APIs.

// Haptic Feedback (Premium Feel)
function haptic(ms = 10) { if(window.navigator && navigator.vibrate) navigator.vibrate(ms); }


// Clear Stuck Overlays (Agar koi modal background me phans jaye)
function clearOverlays() {
  document.querySelectorAll('.mbg').forEach(el => el.remove());
  const sv = document.getElementById('sv');
  if(sv) sv.classList.remove('show');
}


function updateNavIcons(tab){
  const homeEl = document.getElementById('nav-ico-home');
  const exploreEl = document.getElementById('nav-ico-explore');
  const reelsEl = document.getElementById('nav-ico-reels');
  const dmsEl = document.getElementById('nav-ico-dms');
  if(homeEl) homeEl.innerHTML = ico('home', tab==='home'?'#fff':'#555', 24);
  if(exploreEl) exploreEl.innerHTML = ico(tab==='explore'?'compass':'search', tab==='explore'?'#fff':'#555', 24);
  if(reelsEl) reelsEl.innerHTML = ico('film', tab==='reels'?'#fff':'#555', 24);
  if(dmsEl) dmsEl.innerHTML = ico('msg', tab==='dms'?'#fff':'#555', 24);
  const navav=document.querySelector('#nav-av');
  if(navav) navav.style.borderColor=tab==='profile'?'#fff':'#555';
  // FAB ONLY on Home (not Reels, not Search, not Profile, not Chat, not Settings, not Notifications)
  const fab = document.getElementById('fab-main');
  if(fab){
    if(tab === 'home'){
      if(localStorage.getItem('nova-fab-hidden') !== 'true'){
        fab.style.display = 'flex';
      }
    } else {
      fab.style.display = 'none';
      closeFabMenu();
      closeFabLongPressMenu();
    }
  }
}
