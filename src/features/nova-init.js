/**
 * NovaSocial initialization and AI FAB helpers.
 *
 * Extracted as a classic script so settings/inline controls remain
 * window-global; particle effects and Nova Ultra features remain inline.
 */
// INIT: Load saved theme, setup long-press logo for AI
// ═══════════════════════════════════════════════════════════════════════
function initNovaFeatures(){
  loadSavedTheme();
  // FABs stay hidden by default — accessible via Settings menu
  // Setup long-press on logo OR profile nav to open AI
  setupLogoLongPress();
  setupProfileNavHold();
  // Setup draggable FAB
  setupDraggableFAB();
}

// Hold profile nav button (bottom-right avatar) to open AI
function setupProfileNavHold(){
  let pressTimer = null;
  document.addEventListener('touchstart', (e)=>{
    const navAv = e.target.closest('#nav-av, .nb[data-t="profile"]');
    if(navAv){
      pressTimer = setTimeout(()=>{
        toggleNovaAI();
        haptic(25);
        // Visual feedback
        navAv.style.transform = 'scale(1.3)';
        setTimeout(()=>{navAv.style.transform='';}, 300);
      }, 500);
    }
  }, {passive:true});
  document.addEventListener('touchend', ()=>{
    if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
  });
  document.addEventListener('touchmove', ()=>{
    if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
  });
  // Mouse for desktop
  document.addEventListener('mousedown', (e)=>{
    const navAv = e.target.closest('#nav-av, .nb[data-t="profile"]');
    if(navAv){
      pressTimer = setTimeout(()=>{
        toggleNovaAI();
      }, 500);
    }
  });
  document.addEventListener('mouseup', ()=>{
    if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
  });
}

// Draggable, slideable AI FAB
function setupDraggableFAB(){
  const fab = document.getElementById('nova-ai-fab');
  if(!fab) return;

  let isDragging = false;
  let hasMoved = false;
  let startX = 0, startY = 0;
  let fabStartX = 0, fabStartY = 0;
  let pressTimer = null;
  let isHiddenSide = false;

  const startDrag = (clientX, clientY) => {
    isDragging = true;
    hasMoved = false;
    startX = clientX;
    startY = clientY;
    const rect = fab.getBoundingClientRect();
    fabStartX = rect.left;
    fabStartY = rect.top;
    fab.classList.add('dragging');
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    fab.style.left = fabStartX + 'px';
    fab.style.top = fabStartY + 'px';
  };

  const onDrag = (clientX, clientY) => {
    if(!isDragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if(Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;

    let newX = fabStartX + dx;
    let newY = fabStartY + dy;

    // Constrain to viewport
    const fabSize = 54;
    newX = Math.max(0, Math.min(window.innerWidth - fabSize, newX));
    newY = Math.max(0, Math.min(window.innerHeight - fabSize, newY));

    fab.style.left = newX + 'px';
    fab.style.top = newY + 'px';

    // Check if near edge — show "hide" hint
    if(newX <= 4 || newX >= window.innerWidth - fabSize - 4){
      fab.classList.add('hidden-side');
      isHiddenSide = true;
    } else {
      fab.classList.remove('hidden-side');
      isHiddenSide = false;
    }
  };

  const endDrag = () => {
    if(!isDragging) return;
    isDragging = false;
    fab.classList.remove('dragging');

    if(isHiddenSide){
      // Snap to edge and become hidden
      const rect = fab.getBoundingClientRect();
      if(rect.left < window.innerWidth / 2){
        fab.style.left = '-30px';
      } else {
        fab.style.left = (window.innerWidth - 24) + 'px';
      }
      fab.classList.add('hidden-side');
      // Show hint
      showFABHint();
      // Save position
      try { localStorage.setItem('nova-fab-hidden', '1'); } catch(e){}
    } else {
      fab.classList.remove('hidden-side');
      try { localStorage.setItem('nova-fab-hidden', '0'); } catch(e){}
    }

    // Save position
    try {
      localStorage.setItem('nova-fab-pos', JSON.stringify({
        left: fab.style.left,
        top: fab.style.top
      }));
    } catch(e){}

    // If didn't move (tap), open AI
    if(!hasMoved && !pressTimer){
      toggleNovaAI();
    }
  };

  // Touch events
  fab.addEventListener('touchstart', (e) => {
    if(e.touches.length === 1){
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);
      // Long press to hide
      pressTimer = setTimeout(()=>{
        if(!hasMoved){
          // Snap to nearest edge
          const rect = fab.getBoundingClientRect();
          if(rect.left < window.innerWidth / 2){
            fab.style.left = '-30px';
          } else {
            fab.style.left = (window.innerWidth - 24) + 'px';
          }
          fab.classList.add('hidden-side');
          isHiddenSide = true;
          showFABHint();
          try { localStorage.setItem('nova-fab-hidden', '1'); } catch(e){}
          haptic(20);
        }
      }, 600);
    }
  }, {passive:true});

  fab.addEventListener('touchmove', (e) => {
    if(e.touches.length === 1 && isDragging){
      const t = e.touches[0];
      onDrag(t.clientX, t.clientY);
      if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
    }
  }, {passive:true});

  fab.addEventListener('touchend', () => {
    if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
    if(isHiddenSide && !hasMoved){
      // Was a long-press hide, don't end drag
      isDragging = false;
      fab.classList.remove('dragging');
      return;
    }
    endDrag();
  });

  // Mouse events
  fab.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    pressTimer = setTimeout(()=>{
      if(!hasMoved){
        const rect = fab.getBoundingClientRect();
        if(rect.left < window.innerWidth / 2){
          fab.style.left = '-30px';
        } else {
          fab.style.left = (window.innerWidth - 24) + 'px';
        }
        fab.classList.add('hidden-side');
        isHiddenSide = true;
        showFABHint();
        try { localStorage.setItem('nova-fab-hidden', '1'); } catch(e){}
      }
    }, 600);
  });

  document.addEventListener('mousemove', (e) => {
    if(isDragging){
      onDrag(e.clientX, e.clientY);
      if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
    }
  });

  document.addEventListener('mouseup', () => {
    if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
    if(isDragging){
      if(isHiddenSide && !hasMoved){
        isDragging = false;
        fab.classList.remove('dragging');
        return;
      }
      endDrag();
    }
  });

  // Restore saved position
  try {
    const savedPos = JSON.parse(localStorage.getItem('nova-fab-pos') || 'null');
    const wasHidden = localStorage.getItem('nova-fab-hidden') === '1';
    if(savedPos && savedPos.left && savedPos.top){
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.left = savedPos.left;
      fab.style.top = savedPos.top;
      if(wasHidden){
        fab.classList.add('hidden-side');
        isHiddenSide = true;
      }
    }
  } catch(e){}
}

// Show hint when FAB is hidden to side
function showFABHint(){
  // Remove existing hint
  const old = document.querySelector('.nova-fab-hint');
  if(old) old.remove();

  const hint = document.createElement('div');
  hint.className = 'nova-fab-hint';
  hint.textContent = '👉 Slide out to open Nova AI';

  // Position near the FAB
  const fab = document.getElementById('nova-ai-fab');
  if(fab){
    const rect = fab.getBoundingClientRect();
    if(rect.left < window.innerWidth / 2){
      hint.style.left = '12px';
    } else {
      hint.style.right = '12px';
    }
    hint.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
  }

  document.body.appendChild(hint);
  setTimeout(()=>hint.remove(), 2500);
}

function setupLogoLongPress(){
  // Long-press on NovaSocial logo opens AI assistant
  let logoPressTimer = null;
  document.addEventListener('touchstart', (e)=>{
    const logo = e.target.closest('.logo, .alogo');
    if(logo){
      logoPressTimer = setTimeout(()=>{
        toggleNovaAI();
        haptic(20);
      }, 600);
    }
  }, {passive:true});
  document.addEventListener('touchend', ()=>{
    if(logoPressTimer){clearTimeout(logoPressTimer);logoPressTimer=null;}
  });
  document.addEventListener('touchmove', ()=>{
    if(logoPressTimer){clearTimeout(logoPressTimer);logoPressTimer=null;}
  });
  // Mouse long-press for desktop
  document.addEventListener('mousedown', (e)=>{
    const logo = e.target.closest('.logo, .alogo');
    if(logo){
      logoPressTimer = setTimeout(()=>{
        toggleNovaAI();
      }, 600);
    }
  });
  document.addEventListener('mouseup', ()=>{
    if(logoPressTimer){clearTimeout(logoPressTimer);logoPressTimer=null;}
  });
}

// Show AI FAB when user explicitly enables in settings
function showNovaAIFab(){
  const fab = document.getElementById('nova-ai-fab');
  if(fab){ fab.style.display = 'flex'; }
  try { localStorage.setItem('nova-ai-fab-visible', '1'); } catch(e) {}
}

function hideNovaAIFab(){
  const fab = document.getElementById('nova-ai-fab');
  if(fab){ fab.style.display = 'none'; }
  try { localStorage.setItem('nova-ai-fab-visible', '0'); } catch(e) {}
}

function isNovaAIFabVisible(){
  try { return localStorage.getItem('nova-ai-fab-visible') === '1'; } catch(e) { return false; }
}

// Show theme FAB when user explicitly enables in settings
function showThemeFab(){
  const fab = document.getElementById('theme-fab');
  if(fab){ fab.style.display = 'flex'; }
  try { localStorage.setItem('nova-theme-fab-visible', '1'); } catch(e) {}
}

function hideThemeFab(){
  const fab = document.getElementById('theme-fab');
  if(fab){ fab.style.display = 'none'; }
  try { localStorage.setItem('nova-theme-fab-visible', '0'); } catch(e) {}
}

function isThemeFabVisible(){
  try { return localStorage.getItem('nova-theme-fab-visible') === '1'; } catch(e) { return false; }
}

// Patch showApp to init Nova features
const _origShowApp = window.showApp;
if(typeof _origShowApp === 'function'){
  window.showApp = function(){
    _origShowApp.apply(this, arguments);
    setTimeout(initNovaFeatures, 100);
  };
}

// ═══════════════════════════════════════════════════════════════════════
