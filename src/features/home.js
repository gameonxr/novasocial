// Home feed feature — classic script, preserves legacy global handlers.
let feedOffset=0,feedHasMore=true,feedLoading=false;
const FEED_PAGE=10;

// ═══════════════════════════════════════════════════════════════
// NovaEngine X Part 4 — Bounded Feed DOM Pruning
// Max post cards kept in DOM at once. Older off-screen posts get
// pruned (top of list, scrolled far above viewport) to prevent
// unbounded DOM growth over a long scroll session.
// Trade-off (acceptable): pruned posts won't re-render if user
// scrolls back up — full virtual list is future work, not this fix.
// ═══════════════════════════════════════════════════════════════
const FEED_DOM_CAP = 40;

/**
 * Feed DOM ko bounded rakho — agar #feed-list mein FEED_DOM_CAP se zyada
 * post cards hain, oldest (top-of-list) cards ko remove karo — but SIRF
 * agar woh abhi visible viewport se bahar hain (well above current scroll).
 *
 * Safety rules:
 * 1. Sirf post cards (`.post[id^="pc-"]`) touch karta hai — baaki DOM untouched.
 * 2. Card visible hai ya near-visible hai → never remove (uses getBoundingClientRect).
 * 3. Removal se pehle card ke andar ke <video> ko pause() karta hai (memory leak prevent).
 * 4. Pagination/infinite-scroll ko touch nahi karta (sirf downward pruning).
 */
function _pruneFeedDOM() {
  const list = document.getElementById('feed-list');
  if (!list) return;

  const cards = list.querySelectorAll('.post[id^="pc-"]');
  if (cards.length <= FEED_DOM_CAP) return;

  // Sirf top-of-list se prune karte hain (oldest-scrolled-past)
  // Bottom cards (newly added) never touched
  let removedCount = 0;
  const removeBudget = cards.length - FEED_DOM_CAP;

  for (let i = 0; i < cards.length && removedCount < removeBudget; i++) {
    const card = cards[i];
    if (!card || !card.parentNode) continue;

    // Skip current card agar visible hai ya near-visible hai
    const rect = card.getBoundingClientRect();
    const isAboveViewport = rect.bottom < -300;  // 300px buffer above
    const isBelowViewport = rect.top > window.innerHeight + 300;

    // Hum sirf ABOVE-viewport wale cards prune karte hain (downward scroll direction)
    if (!isAboveViewport) {
      // Ye card abhi visible hai ya near-visible hai — break, baaki bhi visible honge
      // (kyunki cards order mein hain, agar ye visible hai to neeche wale bhi honge)
      break;
    }

    // Cleanup: card ke andar ke videos pause karo (memory leak prevent)
    try {
      const videos = card.querySelectorAll('video');
      videos.forEach(v => {
        try { v.pause(); v.src = ''; v.load(); } catch(_) {}
      });
    } catch(_) {}

    // Remove karo
    try { card.parentNode.removeChild(card); } catch(_) {}
    removedCount++;
  }

  if (removedCount > 0) {
    console.log(`[FeedPrune] Removed ${removedCount} old post cards (now ${list.querySelectorAll('.post[id^="pc-"]').length} total)`);
  }
}

async function renderHome(){
  const myGeneration = _renderGeneration; // 🛡️ Capture generation at start
  feedOffset=0;feedHasMore=true;feedLoading=false;
  const scr=document.getElementById('screen');
  const{data:stories}=await db.from('stories').select('*,profiles!stories_user_id_fkey(username,avatar_url)').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(20);

    // Fetch Story Views to determine Unseen Rings
  const { data: myViews } = await db.from('story_views').select('story_id').eq('viewer_id', ME.id);
  const viewedStoryIds = new Set((myViews||[]).map(v => v.story_id));

  // Mark stories as seen/unseen
  svData = (stories || []).map(s => {
    s._seen = viewedStoryIds.has(s.id) || s.user_id === ME.id;
    return s;
  });

  // Unique users for TRAY UI ONLY (Taaki ek user ki ek hi ring dikhe)
  const uniqueTrayUsers = [];
  const storyUserSet = new Set();
  svData.forEach(s => {
    if(!storyUserSet.has(s.user_id)) {
      uniqueTrayUsers.push(s);
      storyUserSet.add(s.user_id);
    }
  });

  scr.innerHTML=`
  <div class="topbar">
    <div class="logo">NovaSocial</div>
    <div style="display:flex;gap:10px;align-items:center">
      <div onclick="toggleNovaAI()" style="cursor:pointer;width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,rgba(255,45,122,0.1),rgba(0,229,255,0.1));border:1px solid rgba(255,45,122,0.15);display:flex;align-items:center;justify-content:center">${ico('sparkles','#FF2D7A',18)}</div>
      <div onclick="go('notifs')" style="cursor:pointer;width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;position:relative">${ico('bell','#fff',18)}<div id="home-notif-dot" style="display:none;position:absolute;top:4px;right:6px;width:8px;height:8px;border-radius:50%;background:#FF2D7A"></div></div>
      <div onclick="go('dms')" style="cursor:pointer;width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center">${ico('msg','#fff',18)}</div>
    </div>
  </div>
       <div class="sbar">
    <div class="si" onclick="showCreate('story')">
      <div style="position:relative">
        ${av(PROF?.avatar_url,PROF?.username||ME?.email,64)}
        <div style="position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#FF2D7A,#833AB4);display:flex;align-items:center;justify-content:center;border:2px solid #000">${ico('plus','#fff',14)}</div>
      </div>
      <span class="sname">Your Story</span>
    </div>
    ${uniqueTrayUsers.map(s=>{
      const startIdx = svData.findIndex(x => x.id === s.id); // Find first story index of this user

      // Check if any story of this user is unseen
      let hasUnseen = false;
      svData.forEach(st => {
        if(st.user_id === s.user_id && !st._seen) hasUnseen = true;
      });

      const ringHtml = hasUnseen
        ? '<div class="avring"><div class="avrinner"><div class="av" style="width:59px;height:59px">'
        : '<div class="av" style="width:59px;height:59px;border:2px solid #333;border-radius:50%;">';
      const closingHtml = hasUnseen ? '</div></div></div>' : '</div>';

      return `
      <div class="si" onclick="openSV(${startIdx})">
        <div style="position:relative;">
          ${ringHtml}
            ${s.profiles?.avatar_url?`<img src="${s.profiles.avatar_url}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:24px;font-weight:700">${(s.profiles?.username||'?')[0].toUpperCase()}</span>`}
          ${closingHtml}
        </div>
        <span class="sname">${s.profiles?.username||''}</span>
      </div>`;
    }).join('')}
  </div>
  <!-- Feed Tabs -->
  <div class="pills" id="feed-tabs">
    <div class="pill" style="background:linear-gradient(135deg,#FF2D7A,#833AB4);color:#fff" onclick="switchFeedTab(this,'foryou')">For You</div>
    <div class="pill" style="background:#121212;color:#8A8A8A" onclick="switchFeedTab(this,'following')">Following</div>
    <div class="pill" style="background:#121212;color:#8A8A8A" onclick="switchFeedTab(this,'trending')">Trending</div>
    <div class="pill" style="background:#121212;color:#8A8A8A" onclick="switchFeedTab(this,'friends')">Friends</div>
    <div class="pill" style="background:#121212;color:#8A8A8A" onclick="switchFeedTab(this,'nearby')">Nearby</div>
  </div>
  <div id="pull-refresh-indicator" class="pull-refresh-indicator"><div id="pull-refresh-spinner" class="pull-refresh-spinner"></div></div>
  <div id="feed-list"></div>
  <div id="feed-loader" class="ldiv" style="display:none"><div class="spin"></div></div>
  <div style="height:80px"></div>`;
  // 📝 Set up pull-to-refresh touch handlers on #feed-list (scoped to Home only)
  setupHomePullToRefresh();
  // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to aage mat badho
  if(myGeneration !== _renderGeneration) return;
  await loadMoreFeedPosts();
  // 📌 Last-known feed timestamp save — silent background refresh is comparison ke liye use karega
  window._lastKnownFeedTimestamp = new Date().toISOString();
  // 🛡️ Re-check after await — agar navigate ho gaya to scroll listener mat lagao
  if(myGeneration !== _renderGeneration) return;
  let _feedScrollRAF = false;
  scr.onscroll = () => {
    if (_feedScrollRAF) return;
    _feedScrollRAF = true;
    requestAnimationFrame(() => {
      _feedScrollRAF = false;
      if (scr.scrollTop + scr.clientHeight > scr.scrollHeight - 600) {
        loadMoreFeedPosts();
      }
    });
  };
}

// ═══════════════════════════════════════════════════════════════
// 📝 PULL-TO-REFRESH (Home feed only)
// Scoped to #feed-list — does NOT touch #screen's touch handlers,
// so Reels swipe and DMs scroll-restoration are completely unaffected.
// overscroll-behavior:contain on #screen (CSS) suppresses the browser's
// native pull-to-refresh, so all listeners can be passive (no preventDefault).
// ═══════════════════════════════════════════════════════════════

/**
 * Attach pull-to-refresh touch handlers to #feed-list.
 * Called from renderHome() after the DOM is created.
 * Only activates when #screen.scrollTop === 0 (already at top) and user
 * drags downward — standard pull-to-refresh pattern.
 */
function setupHomePullToRefresh(){
  const feedList = document.getElementById('feed-list');
  const indicator = document.getElementById('pull-refresh-indicator');
  const spinner = document.getElementById('pull-refresh-spinner');
  if(!feedList || !indicator || !spinner) return;

  let pulling = false;
  let startY = 0;
  let currentPull = 0;
  const THRESHOLD = 75; // px — release past this triggers refresh

  feedList.addEventListener('touchstart', (e) => {
    const scr = document.getElementById('screen');
    if(!scr || scr.scrollTop > 0) return;  // only activate at very top
    if(e.touches.length !== 1) return;     // single-touch only
    pulling = true;
    startY = e.touches[0].clientY;
    currentPull = 0;
    indicator.style.transition = 'none';   // disable transition during live drag
    spinner.classList.remove('spinning');   // clear any leftover spinning state
  }, { passive: true });

  feedList.addEventListener('touchmove', (e) => {
    if(!pulling) return;
    const deltaY = e.touches[0].clientY - startY;
    if(deltaY <= 0){
      // Scrolling up, not pulling down — reset indicator
      currentPull = 0;
      indicator.style.height = '0px';
      spinner.style.opacity = '0';
      return;
    }
    currentPull = deltaY;
    // Apply resistance: pull gets harder as you drag more (dampened after ~120px)
    const resisted = Math.min(deltaY * 0.5, 120);
    indicator.style.height = resisted + 'px';
    spinner.style.opacity = Math.min(1, resisted / THRESHOLD);
    spinner.style.transform = 'rotate(' + (resisted * 2) + 'deg)';
  }, { passive: true });

  feedList.addEventListener('touchend', () => {
    if(!pulling) return;
    pulling = false;
    indicator.style.transition = 'height 0.2s ease, opacity 0.2s ease';
    if(currentPull >= THRESHOLD){
      // Commit: trigger refresh
      indicator.style.height = THRESHOLD + 'px';
      spinner.style.opacity = '1';
      spinner.style.transform = '';
      spinner.classList.add('spinning');
      refreshHomeFeed();
    } else {
      // Cancel: animate back to hidden
      indicator.style.height = '0px';
      spinner.style.opacity = '0';
    }
    currentPull = 0;
  }, { passive: true });

  // Also handle touchcancel (e.g., incoming call interrupts the gesture)
  feedList.addEventListener('touchcancel', () => {
    if(!pulling) return;
    pulling = false;
    indicator.style.transition = 'height 0.2s ease, opacity 0.2s ease';
    indicator.style.height = '0px';
    spinner.style.opacity = '0';
    spinner.classList.remove('spinning');
    currentPull = 0;
  }, { passive: true });
}

/**
 * Triggered by pull-to-refresh when user releases past the threshold.
 * Calls renderHome() to do a full fresh fetch (resets feedOffset, re-fetches
 * stories + posts). The old DOM (including the spinner) gets replaced when
 * renderHome() sets scr.innerHTML — the spinner stays visible during the
 * initial story fetch, then the feed reloads cleanly.
 */
async function refreshHomeFeed(){
  _renderGeneration++;  // invalidate any in-flight renders (matches go() pattern)
  try {
    await renderHome();
  } catch(e) {
    console.error('Pull-to-refresh failed:', e);
    toast('Refresh failed 😕');
  }
}

function switchFeedTab(el, tab){
  document.querySelectorAll('#feed-tabs .pill').forEach(p=>{p.style.background='#121212';p.style.color='#8A8A8A';});
  el.style.background='linear-gradient(135deg,#FF2D7A,#833AB4)';
  el.style.color='#fff';
  if(tab==='trending'){showTrendingPage();return;}
  if(tab==='following'){feedOffset=0;feedHasMore=true;document.getElementById('feed-list').innerHTML='';loadMoreFeedPosts();return;}
  if(tab==='foryou'){feedOffset=0;feedHasMore=true;document.getElementById('feed-list').innerHTML='';loadMoreFeedPosts();return;}
  if(tab==='friends'){toast('Friends feed loading...');feedOffset=0;feedHasMore=true;document.getElementById('feed-list').innerHTML='';loadMoreFeedPosts();return;}
  if(tab==='nearby'){toast('Nearby feed loading...');feedOffset=0;feedHasMore=true;document.getElementById('feed-list').innerHTML='';loadMoreFeedPosts();return;}
}

async function loadMoreFeedPosts(){
  if(feedLoading||!feedHasMore) return;
  feedLoading=true;
  const myGeneration = _renderGeneration;   // 🛡️ is call ki apni generation yaad rakho
  const loader=document.getElementById('feed-loader');
  if(loader) loader.style.display='flex';

  try {
    // DEBUG: Check if ME is set
    if(!ME || !ME.id){
      console.error('❌ ME.id is null!');
      if(loader) loader.style.display='none';
      feedLoading=false;
      document.getElementById('feed-list').innerHTML=`
      <div style="text-align:center;padding:60px 20px;color:#444">
        <div style="font-size:52px;margin-bottom:16px">⚠️</div>
        <div style="font-weight:700;font-size:17px;color:#fff;margin-bottom:8px">Login session issue</div>
        <div style="font-size:13px;margin-bottom:20px">ME.id null hai. Page refresh karo.</div>
        <button class="bgrd" onclick="location.reload()" style="width:auto;padding:13px 28px">🔄 Refresh</button>
      </div>`;
      return;
    }

  const { data: followingData, error: followErr } = await db.from('follows').select('following_id').eq('follower_id', ME.id);

  if(followErr){
    console.error('❌ Follows query error:', followErr);
    throw new Error('Follows query failed: ' + followErr.message);
  }

  const followingIds = (followingData || []).map(f => f.following_id);
  followingIds.push(ME.id);

  console.log('🔍 Feed debug:', { ME_id: ME.id, followingCount: followingIds.length, offset: feedOffset });

  let posts = [];
  if(followingIds.length > 0){
    // Main query with profiles join
    // Part 8 Fix: explicit column list instead of select('*') — saves bandwidth on highest-traffic query.
    // Verified fields: postCard() uses id, user_id, media_url, media_type, thumbnail_url, caption,
    // location, likes_count, comments_count, views_count, created_at + joined profile fields.
    // is_reel + is_archived are NOT selected here (used as .eq() filters only, not accessed on p.<field> in postCard).
    // thumbnail_url MUST be included — Part 7 Fix 2 uses it for video poster attribute (omit = video posts lose poster).
    let res = await db.from('posts').select('id,user_id,media_url,media_type,thumbnail_url,caption,location,likes_count,comments_count,views_count,created_at,profiles!posts_user_id_fkey(username,avatar_url,is_verified,last_seen)').eq('is_reel',false).eq('is_archived', false).in('user_id', followingIds).order('created_at',{ascending:false}).range(feedOffset,feedOffset+FEED_PAGE-1);

    if(res.error){
      console.error('❌ Posts query error (with profiles join):', res.error);
      console.log('🔄 Trying fallback query without profiles join...');

      // Fallback: query without profiles join (Part 8 Fix: explicit columns, no select('*'))
      res = await db.from('posts').select('id,user_id,media_url,media_type,thumbnail_url,caption,location,likes_count,comments_count,views_count,created_at').eq('is_reel',false).eq('is_archived', false).in('user_id', followingIds).order('created_at',{ascending:false}).range(feedOffset,feedOffset+FEED_PAGE-1);

      if(res.error){
        console.error('❌ Fallback query also failed:', res.error);
        throw new Error('Posts query failed: ' + res.error.message);
      }

      // Manually fetch profiles for each post
      const userIds = [...new Set((res.data || []).map(p => p.user_id))];
      if(userIds.length){
        const { data: profData } = await db.from('profiles').select('id,username,avatar_url,is_verified,last_seen').in('id', userIds);
        const profMap = {};
        (profData || []).forEach(p => { profMap[p.id] = p; });
        posts = (res.data || []).map(p => ({ ...p, profiles: profMap[p.user_id] || { username: 'user', avatar_url: null } }));
      } else {
        posts = res.data || [];
      }
      console.log('✅ Fallback posts fetched:', posts.length);
    } else {
      posts = res.data || [];
      console.log('✅ Posts fetched:', posts.length);
    }
  }

  if(loader) loader.style.display='none';
  if(!posts.length){
    feedHasMore=false;feedLoading=false;
    if(feedOffset===0){
      document.getElementById('feed-list').innerHTML=`
      <div style="text-align:center;padding:60px 20px;color:#444">
        <div style="font-size:52px;margin-bottom:16px">📸</div>
        <div style="font-weight:700;font-size:17px;color:#fff;margin-bottom:8px">Koi post nahi abhi</div>
        <div style="font-size:14px;margin-bottom:20px">Logon ko follow karo ya apni post share karo!</div>
        <button class="bgrd" onclick="go('explore')" style="width:auto;padding:13px 28px;margin-top:10px">Explore Karein</button>
      </div>`;
    }
    return;
  }

  const blockedIds = await getBlockedBothWaysSet();
  let mutedIds = new Set();
try {
  const { data: mutedData } = await db.from('mutes').select('muted_id').eq('muter_id', ME.id);
  mutedIds = new Set((mutedData || []).map(m => m.muted_id));
} catch(e) { console.log('mutes skip'); }

  const validPosts = posts.filter(p => !blockedIds.has(p.user_id) && !mutedIds.has(p.user_id));

  let likedSet=new Set(),savedSet=new Set(),reactionMap={};
  const ids=validPosts.map(p=>p.id);
  if(ids.length > 0){
    const[{data:lk},{data:sv}]=await Promise.all([
      db.from('likes').select('post_id,reaction').eq('user_id',ME.id).in('post_id',ids),
      db.from('bookmarks').select('post_id').eq('user_id',ME.id).in('post_id',ids)
    ]);
    (lk||[]).forEach(x=>{likedSet.add(x.post_id);reactionMap[x.post_id]=x.reaction||'heart';});
    (sv||[]).forEach(x=>savedSet.add(x.post_id));
  }

  validPosts.forEach(p => { recordPostView(p.id); });

  // 🛡️ RACE CONDITION GUARD: User kahin aur navigate kar chuka hai is await ke dauran — safely abort
  if(myGeneration !== _renderGeneration){
    feedLoading=false;
    return;
  }
  const list=document.getElementById('feed-list');
  if(!list){
    // Extra safety: element nahi mila to bhi crash mat hone do
    feedLoading=false;
    return;
  }
  list.insertAdjacentHTML('beforeend',validPosts.map(p=>postCard(p,likedSet.has(p.id),savedSet.has(p.id),reactionMap[p.id]||'heart')).join(''));
  feedOffset+=posts.length;
  if(posts.length<FEED_PAGE) feedHasMore=false;
  feedLoading=false;
  setTimeout(()=>initVideoObserver(),300);
  // ── Part 4: Bounded feed DOM pruning — remove old off-screen post cards
  // to prevent unbounded DOM growth over long scroll sessions.
  setTimeout(()=>_pruneFeedDOM(), 350); // slight delay so layout settles before rect check
  } catch(e) {
    console.error('❌ Feed load error:', e);
    if(loader) loader.style.display='none';
    feedLoading=false;
    if(feedOffset===0){
      const list=document.getElementById('feed-list');
      const errorMsg = e.message||'Unknown error';
      if(list){
        list.innerHTML=`<div style="text-align:center;padding:60px 20px;color:#444">
          <div style="font-size:52px;margin-bottom:16px">⚠️</div>
          <div style="font-weight:700;font-size:17px;color:#fff;margin-bottom:8px">Feed load nahi hua</div>
          <div style="font-size:12px;margin-bottom:8px;color:#888;word-break:break-all;padding:0 20px">${errorMsg}</div>
          <div style="font-size:11px;color:#666;margin-bottom:16px">SQL reset script run kiya? Supabase → SQL Editor</div>
          <button class="bgrd" onclick="renderHome()" style="width:auto;padding:13px 28px;margin-top:10px">🔄 Retry</button>
        </div>`;
      } else {
        // FIX: feed-list not in DOM, show error on screen directly
        const scr=document.getElementById('screen');
        if(scr){
          scr.innerHTML=`<div class="topbar"><div class="logo">NovaSocial</div></div>
          <div style="text-align:center;padding:60px 20px;color:#444">
            <div style="font-size:52px;margin-bottom:16px">⚠️</div>
            <div style="font-weight:700;font-size:17px;color:#fff;margin-bottom:8px">Feed load nahi hua</div>
            <div style="font-size:12px;margin-bottom:16px;color:#888">${errorMsg}</div>
            <button class="bgrd" onclick="renderHome()" style="width:auto;padding:13px 28px">🔄 Retry</button>
          </div>`;
        }
      }
    }
  }
}
