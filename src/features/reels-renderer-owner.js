window.renderReels = async function(){
  // ── PERSISTENT CONTAINER GUARD — agar reels already rendered hai, sirf show karo, rebuild mat karo ──
  // Isse video state aur currentReelIdx automatically preserve rahega jab wapas Reels tab pe aao
  const existingContainer = document.getElementById('reels-persistent-container');
  if(existingContainer){
    const scr = document.getElementById('screen');
    if(scr){
      scr.innerHTML = '';
      scr.appendChild(existingContainer);
      existingContainer.style.display = 'block';
      // ── SPLIT-VIEW FIX: same overflow:hidden + scrollTop:0 reset as _tryRestoreFromCache ──
      // (this code path can be hit instead of the restore path; both must behave identically)
      scr.style.overflow = 'hidden';
      scr.scrollTop = 0;
    }
    // Jo reel pehle se play ho rahi thi, use resume karo
    try {
      const v = document.getElementById('rv-'+currentReelIdx);
      if(v){ v.muted = reelsMuted; v.play().catch(()=>{}); }
    } catch(_) {}
    // ── Part 3: Re-apply windowing on tab revisit (in case some src were
    // released by browser GC while parked). Ensures current reel + nearby
    // videos are loaded before user interacts.
    try { _applyReelsVideoWindowing(currentReelIdx); } catch(_) {}
    return; // rebuild skip
  }

  const myGeneration = _renderGeneration; // 🛡️ Capture generation
  const scr=document.getElementById('screen');
  try {
  // Main query with profiles join
  let { data: reels, error: reelsErr } = await db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url,is_verified)').eq('is_reel',true).order('created_at',{ascending:false}).limit(20);

  if(reelsErr){
    console.error('❌ Reels query error (with join):', reelsErr);
    console.log('🔄 Trying fallback...');
    // Fallback without join
    const fallback = await db.from('posts').select('*').eq('is_reel',true).order('created_at',{ascending:false}).limit(20);
    if(fallback.error) throw new Error('Reels query failed: ' + fallback.error.message);
    // Fetch profiles manually
    const userIds = [...new Set((fallback.data || []).map(p => p.user_id))];
    if(userIds.length){
      const { data: profData } = await db.from('profiles').select('id,username,avatar_url,is_verified').in('id', userIds);
      const profMap = {};
      (profData || []).forEach(p => { profMap[p.id] = p; });
      reels = (fallback.data || []).map(p => ({ ...p, profiles: profMap[p.user_id] || { username: 'user' } }));
    } else {
      reels = fallback.data;
    }
  }

  console.log('✅ Reels fetched:', reels?.length || 0);

  // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to aage mat badho
  if(myGeneration !== _renderGeneration) return;
  if(!scr) return; // extra safety

  if(!reels?.length){
    scr.innerHTML=`<div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:20px">
      <div style="font-size:56px">🎬</div>
      <div style="font-weight:700;font-size:17px">Koi Reel nahi abhi</div>
      <div style="color:#555;font-size:14px">Pehla reel banao!</div>
      <button class="bgrd" onclick="showCreate('reel')" style="width:auto;padding:13px 32px">🎬 New Reel</button>
    </div>`;return;
  }
  let likedSet=new Set(),reactionMap={};
  const ids=reels.map(r=>r.id);
  const{data:lk}=await db.from('likes').select('post_id,reaction').eq('user_id',ME.id).in('post_id',ids);
  (lk||[]).forEach(x=>{likedSet.add(x.post_id);reactionMap[x.post_id]=x.reaction||'heart';});

  // 🛡️ Re-check after likes await
  if(myGeneration !== _renderGeneration) return;
  if(!scr) return;

  let ri=0;
  currentReelIdx=0;
  scr.style.overflow='hidden';
  scr.scrollTop=0;
  scr.innerHTML=`<div id="reels-persistent-container" style="height:100%;position:relative;overflow:hidden">
  <!-- Reels/Notes Toggle — rendered once at container level (Bug 2 Fix: not per-reel) -->
  <div id="reels-toggle-pill" style="position:absolute;top:52px;left:50%;transform:translateX(-50%);display:flex;background:rgba(0,0,0,0.35);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:20px;padding:3px;z-index:100;border:1px solid rgba(255,255,255,0.08);transition:opacity 0.2s cubic-bezier(0.25,0.46,0.45,0.94),transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94)">
    <div id="toggle-reels-btn" onclick="switchReelsView('reels')" style="padding:6px 18px;font-size:13px;font-weight:700;color:#FF2D7A;background:rgba(255,45,122,0.15);border-radius:16px;cursor:pointer;transition:0.2s cubic-bezier(0.25,0.46,0.45,0.94)">Reels</div>
    <div id="toggle-notes-btn" onclick="switchReelsView('notes')" style="padding:6px 18px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.5);border-radius:16px;cursor:pointer;transition:0.2s cubic-bezier(0.25,0.46,0.45,0.94)">Notes</div>
  </div>
  <div id="rwrap" style="height:100%;position:relative;overflow:hidden;touch-action:pan-y">
    <div id="rinner" style="height:${reels.length*100}%;transition:transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)">
      ${reels.map((r,i)=>{
        const liked=likedSet.has(r.id), reaction=reactionMap[r.id]||'heart';
        return `
        <div style="height:${100/reels.length}%;position:relative;background:#000;overflow:hidden">
                   <div ondblclick="dblLikeReel('${r.id}', this)" style="position:absolute;inset:0;z-index:1;"></div>
          ${r.media_url?`<video data-media-url="${r.media_url}" ${r.thumbnail_url?`poster="${r.thumbnail_url}"`:''} ${i<=3?`src="${r.media_url}"`:''} class="rvid" id="rv-${i}" muted playsinline loop></video>`:`<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a0533,#0d1f3c);display:flex;align-items:center;justify-content:center;font-size:90px">🎬</div>`}
          <div class="reel-progress-bar" style="position:absolute;bottom:0;left:0;height:3px;background:${GRAD};width:0%;z-index:5;"></div>
         <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 40%,transparent 70%,rgba(0,0,0,0.3) 100%);pointer-events:none;"></div>
          <div style="position:absolute;top:0;left:0;right:0;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;z-index:5">
            <span style="font-weight:800;font-size:18px;text-shadow:0 2px 8px rgba(0,0,0,0.8)">Reels</span>
            <div onclick="showCreate('reel')" style="cursor:pointer">${ico('cam')}</div>
          </div>
          <div class="mute-btn" onclick="toggleReelsMute()" style="z-index:6"><span class="mute-icon">${reelsMuted?ico('mute','#fff',20):ico('unmute','#fff',20)}</span></div>
          <div style="position:absolute;right:12px;bottom:110px;display:flex;flex-direction:column;gap:22px;align-items:center;z-index:5">
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:5px">
              <div id="lbtn-${r.id}" data-liked="${liked}" data-cnt="${r.likes_count||0}" data-owner="${r.user_id}" data-reaction="${reaction}"
                onclick="toggleLike('${r.id}')" ontouchstart="startLongPress('${r.id}')" ontouchend="cancelLongPress()" ontouchmove="cancelLongPress()" style="cursor:pointer">
                ${likeIconHTML(liked,reaction)}
              </div>
              <span id="lcnt-${r.id}-txt" style="color:#fff;font-size:12px;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,0.8)">${fmt(r.likes_count||0)}</span>
              <div id="rbar-${r.id}" class="reaction-bar" style="bottom:auto;top:0;left:auto;right:46px"></div>
            </div>
            <div onclick="openComments('${r.id}')" style="display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer">
              ${ico('comment')}<span id="ccnt-${r.id}-txt" style="color:#fff;font-size:12px;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,0.8)">${fmt(r.comments_count||0)}</span>
            </div>
            <div onclick="shareIt()" style="display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer">
              ${ico('send')}<span style="color:#fff;font-size:12px;font-weight:700">Share</span>
            </div>
          </div>
          <div style="position:absolute;left:14px;right:64px;bottom:80px;z-index:5">
            <div onclick="goToProfile('${r.user_id}')" style="display:flex;align-items:center;gap:10px;margin-bottom:10px;cursor:pointer">
              ${av(r.profiles?.avatar_url,r.profiles?.username,40)}
              <span style="font-weight:700;font-size:15px;text-shadow:0 1px 6px rgba(0,0,0,0.9)">${r.profiles?.username||''}</span>
              ${r.profiles?.is_verified?ico('verified','',14):''}
            </div>
            ${r.caption?`<div style="color:rgba(255,255,255,0.92);font-size:14px;line-height:1.5;text-shadow:0 1px 6px rgba(0,0,0,0.9)">${r.caption}</div>`:''}
          </div>
          <div style="position:absolute;right:4px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:5px;z-index:5">
            ${reels.map((_,j)=>`<div style="width:3px;height:${j===i?18:5}px;border-radius:3px;background:${j===i?'#fff':'rgba(255,255,255,0.3)'};transition:all 0.3s"></div>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div></div>`;

  const wrap=document.getElementById('rwrap');
  const inner=document.getElementById('rinner');

  function dblLikeReel(pid, cont) {
  const el=document.getElementById('lbtn-'+pid);
  if(el&&el.dataset.liked!=='true') toggleLike(pid);

  // Flying Hearts Animation
  for(let i=0; i<6; i++) {
    setTimeout(() => {
      const p=document.createElement('div');
      p.textContent='❤️';
      p.style.cssText = 'position:absolute; top:'+(30 + Math.random() * 40)+'%; left:'+(30 + Math.random() * 40)+'%; font-size:'+(40 + Math.random() * 30)+'px; pointer-events:none; z-index:10; animation:heartPop 0.8s ease forwards;';
      cont.appendChild(p);
      setTimeout(()=>p.remove(), 800);
    }, i * 100);
  }
}

  // FIX: Pehle reel ko manually play karo
  setTimeout(() => {
    const firstVid = document.getElementById('rv-0');
    if(firstVid){
      firstVid.muted = reelsMuted;
      firstVid.play().catch(()=>{});
    }
  }, 100);

  // Reels Progress Bar Logic
  document.querySelectorAll('.rvid').forEach(vid => {
    const progressBar = vid.parentElement.querySelector('.reel-progress-bar');
    if(progressBar) {
      vid.ontimeupdate = () => {
        if(vid.duration > 0) {
          progressBar.style.width = ((vid.currentTime / vid.duration) * 100) + '%';
        }
      };
    }
  });

  // ── Bug 3 Fix: Instagram/TikTok-style live drag swipe navigation ──
  let sy=0;            // touchstart Y position
  let st=0;            // touchstart timestamp (for velocity)
  let lastY=0;         // last touchmove Y (for velocity)
  let lastT=0;         // last touchmove timestamp
  let isDragging=false;
  let isSettling=false; // Fix: tracks whether settle animation is still in-flight

  // Fix: Compute reelPct dynamically from live DOM — never stale after tab-switch/restore
  // Old code cached `const reelPct = 100 / reels.length` as a closure variable,
  // but the fast-restore path uses `rinner.children.length` (live DOM count) which
  // could differ from the closure's `reels.length`. This function always reads
  // the live DOM count, ensuring touch handlers and restore path use the SAME value.
  function getCurrentReelPct() {
    const rinnerEl = document.getElementById('rinner');
    const count = rinnerEl ? rinnerEl.children.length : reels.length;
    return count > 0 ? 100 / count : 0;
  }
  function getCurrentReelCount() {
    const rinnerEl = document.getElementById('rinner');
    return rinnerEl ? rinnerEl.children.length : reels.length;
  }

  wrap.addEventListener('touchstart',e=>{
    sy=e.touches[0].clientY;
    st=Date.now();
    lastY=sy;
    lastT=st;
    isDragging=true;

    const rpct = getCurrentReelPct();

    // Fix: If a settle animation is still in-flight from a previous swipe,
    // force-complete it immediately so ri*rpct is the ACTUAL visual position.
    if (isSettling) {
      isSettling = false;
      inner.style.transition = 'none';
      inner.style.transform = `translateY(-${ri * rpct}%)`;
      // Force a reflow so the browser registers the position change before we allow touchmove
      void inner.offsetHeight;
    }

    // Disable transition during live drag (so finger movement is 1:1)
    inner.style.transition='none';
  },{passive:true});

  wrap.addEventListener('touchmove',e=>{
    if(!isDragging) return;
    const cy=e.touches[0].clientY;
    const delta=sy-cy; // positive = swiping up (forward), negative = swiping down (backward)
    lastY=cy;
    lastT=Date.now();

    // Fix: Use dynamic reelPct from live DOM (not stale closure variable)
    const rpct = getCurrentReelPct();
    const reelCount = getCurrentReelCount();
    const basePct = ri * rpct;
    const dragPct = (delta / wrap.clientHeight) * rpct;

    // Rubber-band at edges (first reel can't go further up, last can't go further down)
    let targetPct = basePct + dragPct;
    if (ri === 0 && targetPct < 0) {
      // Rubber-band: resist movement past first reel
      targetPct = targetPct * 0.4;
    }
    if (ri === reelCount - 1 && targetPct > (reelCount - 1) * rpct) {
      // Rubber-band: resist movement past last reel
      const maxPct = (reelCount - 1) * rpct;
      targetPct = maxPct + (targetPct - maxPct) * 0.4;
    }

    inner.style.transform = `translateY(-${targetPct}%)`;
  },{passive:true});

  wrap.addEventListener('touchend',e=>{
    if(!isDragging) return;
    isDragging=false;

    const cy=e.changedTouches[0].clientY;
    const d=sy-cy; // total drag distance (positive=forward, negative=backward)
    const dt=Date.now()-st; // total drag duration
    const velocity = dt > 0 ? Math.abs(d) / dt : 0; // px per ms

    const rpct = getCurrentReelPct();
    const reelCount = getCurrentReelCount();

    const old=ri;
    // Decision: commit to next/previous or snap back
    const reelHeight = wrap.clientHeight;
    const dragRatio = Math.abs(d) / reelHeight;
    const isFastFlick = velocity > 0.35;

    if (d > 0 && ri < reelCount - 1) {
      // Swiping up (forward) — go to next reel
      if (isFastFlick || dragRatio > 0.22) ri++;
    } else if (d < 0 && ri > 0) {
      // Swiping down (backward) — go to previous reel
      if (isFastFlick || dragRatio > 0.22) ri--;
    }
    // else: snap back to current ri (no change)

    // Re-enable smooth transition for the snap/settle animation
    // (240ms easeOutQuint — snappy "pop and lock" feel, matching Instagram/TikTok reels)
    inner.style.transition = 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)';
    inner.style.transform = `translateY(-${ri * rpct}%)`;
    isSettling = true; // Fix: mark that a settle animation is in-flight

    // Clean up transition + settle flag after animation completes
    // (290ms = 240ms animation + 50ms safety buffer; keeps settle flag from lingering)
    setTimeout(() => {
      if (!isDragging) inner.style.transition = '';
      isSettling = false; // Fix: settle animation finished, position is now at rest
    }, 290);

    // If index didn't change, just snap back — skip the rest
    if (ri === old) return;

    currentReelIdx=ri;
    window._savedReelIndex=ri;

    // ── Auto-hide toggle on forward swipe, show on backward swipe (Reels mode only) ──
    if (window._reelsViewMode === 'reels') {
      const togglePill = document.getElementById('reels-toggle-pill');
      if (togglePill) {
        if (ri > old) {
          togglePill.style.opacity = '0';
          togglePill.style.transform = 'translateX(-50%) translateY(-8px)';
          togglePill.style.pointerEvents = 'none';
        } else {
          togglePill.style.opacity = '1';
          togglePill.style.transform = 'translateX(-50%) translateY(0)';
          togglePill.style.pointerEvents = '';
        }
      }
    }

    // ── Part 3: Update video src windowing (memory management) ──
    try { _applyReelsVideoWindowing(ri); } catch(_) {}

    document.querySelectorAll('.rvid').forEach(v => v.pause());
    const v=document.getElementById('rv-'+ri);
    if(v){
      v.muted=reelsMuted;
      v.currentTime=0;
      v.play().catch(()=>{});
    }
  },{passive:true});
  } catch(e) {
    console.error('Reels load error:', e);
    scr.innerHTML=`<div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:20px">
      <div style="font-size:56px">⚠️</div>
      <div style="font-weight:700;font-size:17px;color:#fff">Reels load nahi hue</div>
      <div style="color:#888;font-size:13px">Error: ${e.message||'Unknown'}</div>
      <button class="bgrd" onclick="go('reels')" style="width:auto;padding:13px 32px">Retry</button>
    </div>`;
  }

  // ── PART 4 (CORRECTED): Reels position restore via TRANSFORM, not scrollTop ──
  // Reels apna swipe navigation CSS transform se karta hai (translateY),
  // scrollTop se nahi — isliye humein 'ri' variable aur transform dono ko
  // restore karna hai. 'inner' variable is function ke andar already scope mein hai.
  if (window._savedReelIndex !== undefined && window._savedReelIndex > 0 && window._savedReelIndex < reels.length) {
    ri = window._savedReelIndex;
    currentReelIdx = ri;

    requestAnimationFrame(() => {
      // 'inner' variable already is function ke scope mein hai (line ~8318)
      if (inner) {
        inner.style.transition = 'none'; // Animation SKIP karo restore ke waqt
        inner.style.transform = `translateY(-${ri * (100 / reels.length)}%)`;

        // Ek frame baad transition wapas enable karo (future swipes smooth rahen)
        requestAnimationFrame(() => {
          inner.style.transition = '';
        });
      }

      // ── Part 3: Apply video src windowing for restored position
      // Ensures current reel + nearby videos have src loaded after tab revisit
      try { _applyReelsVideoWindowing(ri); } catch(_) {}

      // Sahi reel ka video play karo, baaki sab pause
      document.querySelectorAll('.rvid').forEach(v => v.pause());
      const activeVid = document.getElementById('rv-' + ri);
      if (activeVid) {
        activeVid.muted = reelsMuted;
        activeVid.play().catch(() => {});
      }
    });
  }
};
