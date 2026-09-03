// _silentBackgroundRefresh — extracted from index.html
// Owner SHA-256: ae592cb1d0d8bd3769903f4647c61c500fbe3809a9fd6f99d952f07eb66479bb
// Classic script — exposes window._silentBackgroundRefresh

window._silentBackgroundRefresh = async function _silentBackgroundRefresh(tab) {
  const myGeneration = _renderGeneration;

  // Chhota delay taaki UI thread free rahe (cached content already dikh chuka hai)
  await new Promise(r => setTimeout(r, 400));

  // Agar is dauran user ne phir se tab change kar diya, skip karo
  if (myGeneration !== _renderGeneration) return;
  if (curTab !== tab) return;

  const scr = document.getElementById('screen');
  if (!scr) return;

  // Do not let the DMs refresh patch the chat screen while an async chat open
  // is fetching members/conversation data.
  if (tab === 'dms' && window._chatScreenActive) return;

  try {
    if(tab==='home'){
      // Poora rebuild MAT karo — sirf check karo kya naye posts hain
      try{
        const{data:latestPost} = await db.from('posts').select('created_at').eq('is_reel',false).eq('is_archived',false).order('created_at',{ascending:false}).limit(1).maybeSingle();
        if(latestPost && window._lastKnownFeedTimestamp && new Date(latestPost.created_at) > new Date(window._lastKnownFeedTimestamp)){
          showNewPostsIndicator();
        }
      }catch(e){}
      return; // yahan se return, baaki tabs ka existing logic neeche chalta raheg
    }
    else if(tab==='dms') {
      // ── NON-DESTRUCTIVE DMs REFRESH (Home-tab-style) ──
      // NO full renderDMs() here. Instead, fetch just enough to detect what
      // changed, then patch the DOM in-place (unread badges, preview text,
      // new conversations, notes bar). The scrollable container is NEVER
      // replaced, so scrollTop is NEVER reset — no scroll-jump/race possible.
      await _refreshDmsInPlace();
      // Skip the post-render scroll-restore block below — non-destructive
      // refresh means scroll position was never touched. Just save the
      // refreshed cache snapshot.
      if (curTab === tab) _saveTabToCache(tab);
      return;
    }
    else if(tab==='explore') await renderExplore();
    else if(tab==='notifs') await renderNotifs();
    else if(tab==='profile') await renderProfile();

    // ── CRITICAL: renderX() ke innerHTML replace ke TURANT BAAD scroll restore karo ──
    // (Only for tabs that still do full destructive re-renders above: explore,
    // notifs, profile. dms case returned early above. home returned early too.)
    if (curTab === tab && scr) {
      const scrollBeforeRefresh = scr.scrollTop;
      scr.scrollTop = scrollBeforeRefresh;

      // Extra safety: kabhi kabhi images load hone ke baad layout
      // shift hoti hai (lazy-loaded images height claim karte hain) —
      // ek chhota follow-up correction taaki wo bhi handle ho
      requestAnimationFrame(() => {
        if (curTab === tab && scr) {
          scr.scrollTop = scrollBeforeRefresh;
        }
      });
    }

    // Refresh ke baad naya snapshot cache mein save karo
    if (curTab === tab) _saveTabToCache(tab);
  } catch(e) {
    console.warn('[Cache] Background refresh failed silently:', e.message);
  }
};
