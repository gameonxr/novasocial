// Shared modal component — classic script, preserves legacy global APIs.
// ── MODAL HELPER ──────────────────────────────────────
let _modalSubPageStack = []; // tracks {title, html} for back navigation

function modal(title){
  const existing = document.getElementById('cmodal');
  if(existing){
    _navLog('MODAL nesting subpage "' + title + '" — modal already open');
    const titleEl = existing.querySelector('#modal-title-span');
    const bodyEl = existing.querySelector('#mbody');
    const currentTitle = titleEl ? titleEl.textContent : '';
    const currentHtml = bodyEl ? bodyEl.innerHTML : '';
    _modalSubPageStack.push({ title: currentTitle, html: currentHtml });
    pauseAllVideos();
    if(titleEl) titleEl.textContent = title;
    if(bodyEl) bodyEl.innerHTML = '';
    // Show back arrow since we're now nested
    const backBtn = existing.querySelector('#modal-back-btn');
    if(backBtn) backBtn.style.display = 'flex';
    pushNavState('subpage', title, function(){
      const prev = _modalSubPageStack.pop();
      const m2 = document.getElementById('cmodal');
      if(m2 && prev){
        const t2 = m2.querySelector('#modal-title-span');
        if(t2) t2.textContent = prev.title;
        const b2 = m2.querySelector('#mbody');
        if(b2) b2.innerHTML = prev.html;
        // Hide back arrow if no more subpages below
        if(window.navStack.length === 0 || window.navStack[window.navStack.length-1].type !== 'subpage'){
          const bb = m2.querySelector('#modal-back-btn');
          if(bb) bb.style.display = 'none';
        }
      }
    });
    _navLog('MODAL nested-push done for "' + title + '"');
    return existing;
  }
  _navLog('MODAL fresh "' + title + '"');
  closeModal();
  pauseAllVideos();
  const el=document.createElement('div');
  el.className='mbg';el.id='cmodal';
  el.innerHTML=`<div class="msheet"><div class="mhdr"><div style="display:flex;align-items:center;gap:10px"><div id="modal-back-btn" onclick="modalGoBack()" style="cursor:pointer;padding:4px;display:none">${ico('back','#fff',20)}</div><span id="modal-title-span" style="font-weight:700;font-size:16px">${title}</span></div><div onclick="closeModal()" style="cursor:pointer;padding:4px">${ico('close')}</div></div><div id="mbody"></div></div>`;
  el.onclick=e=>{if(e.target===el)closeModal();};
  document.body.appendChild(el);
  pushNavState('modal', 'cmodal', closeModal);
  _navLog('MODAL fresh-create done for "' + title + '"');
  return el;
}

// In-UI back arrow for nested settings — 100% reliable, no hardware back dependency
function modalGoBack(){
  if(window.navStack.length === 0) return;
  const top = window.navStack[window.navStack.length - 1];
  if(top.type !== 'subpage'){
    closeModal();
    return;
  }
  window.navStack.pop();
  window._navPopInProgress = true;
  try{ if(top.closeFn) top.closeFn(); }catch(e){ console.error(e); }
  window._navPopInProgress = false;
  if('pushState' in history && !window._historyApiBroken){
    try{ history.pushState({navDepth: window.navStack.length}, '', location.href); }catch(e){}
  }
  if(window.navStack.length === 0 || window.navStack[window.navStack.length-1].type !== 'subpage'){
    const backBtn = document.getElementById('modal-back-btn');
    if(backBtn) backBtn.style.display = 'none';
  }
}

function closeModal(){
  _navLog('CLOSE closeModal() called | _navPopInProgress=' + window._navPopInProgress);
  if(!window._navPopInProgress){
    while(window.navStack.length > 0 && window.navStack[window.navStack.length-1].type === 'subpage'){
      window.navStack.pop();
    }
    _modalSubPageStack = [];
    if(window.navStack.length > 0 && window.navStack[window.navStack.length-1].type === 'modal'){
      window.navStack.pop();
    }
  }
  _navLog('CLOSE (after stack cleanup)');
  pauseAllVideos();
  const m=document.getElementById('cmodal');if(m)m.remove();
  _navLog('CLOSE (after DOM remove)');
  if(curTab==='reels'){
    const v=document.getElementById('rv-'+currentReelIdx);
    if(v){v.muted=reelsMuted;v.play().catch(()=>{});}
  }
}
